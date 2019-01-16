import Controller, { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';
import $ from 'jquery';

import WebRTC from '../services/web-rtc';
import Peer from '../models/peer';

export default Controller.extend({
  application: controller('application'),
  you: alias('application.you'),
  room: null,
  webrtc: null,

  _onRoomConnected(event, data) {
    const you = this.get('you');
    const room = this.get('room');

    you.get('peer').setProperties(data.peer);
    // eslint-disable-next-line no-param-reassign
    delete data.peer;
    you.setProperties(data);

    // Initialize WebRTC
    this.set(
      'webrtc',
      new WebRTC(you.get('uuid'), {
        room: room.name,
        firebaseRef: window.ShareDrop.ref,
      })
    );
  },

  _onRoomDisconnected() {
    this.get('model').clear();
    this.set('webrtc', null);
  },

  _onRoomUserAdded(event, data) {
    const you = this.get('you');

    if (you.get('uuid') !== data.uuid) {
      this._addPeer(data);
    }
  },

  _addPeer(attrs) {
    const peerAttrs = attrs.peer;

    // eslint-disable-next-line no-param-reassign
    delete attrs.peer;
    const peer = Peer.create(attrs);
    peer.get('peer').setProperties(peerAttrs);

    this.get('model').pushObject(peer);
  },

  _onRoomUserChanged(event, data) {
    const peers = this.get('model');
    const peer = peers.findBy('uuid', data.uuid);
    const peerAttrs = data.peer;
    const defaults = {
      uuid: null,
      public_ip: null,
    };

    if (peer) {
      // eslint-disable-next-line no-param-reassign
      delete data.peer;
      // Firebase doesn't return keys with null values,
      // so we have to add them back.
      peer.setProperties($.extend({}, defaults, data));
      peer.get('peer').setProperties(peerAttrs);
    }
  },

  _onRoomUserRemoved(event, data) {
    const peers = this.get('model');
    const peer = peers.findBy('uuid', data.uuid);

    peers.removeObject(peer);
  },

  _onPeerP2PIncomingConnection(event, data) {
    const { connection } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    // Don't switch to 'connecting' state on incoming connection,
    // as p2p connection may still fail.
    peer.set('peer.connection', connection);
  },

  _onPeerDCIncomingConnection(event, data) {
    const { connection } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    peer.set('peer.state', 'connected');
  },

  _onPeerDCIncomingConnectionError(event, data) {
    const { connection, error } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    switch (error.type) {
      case 'failed':
        peer.setProperties({
          'peer.connection': null,
          'peer.state': 'disconnected',
          state: 'error',
          errorCode: 'connection-failed',
        });
        break;
      case 'disconnected':
        // TODO: notify both sides
        break;
      default:
        break;
    }
  },

  _onPeerP2POutgoingConnection(event, data) {
    const { connection } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    peer.setProperties({
      'peer.connection': connection,
      'peer.state': 'connecting',
    });
  },

  _onPeerDCOutgoingConnection(event, data) {
    const { connection } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);
    const file = peer.get('transfer.file');
    const webrtc = this.get('webrtc');
    const info = webrtc.getFileInfo(file);

    peer.set('peer.state', 'connected');
    peer.set('state', 'awaiting_response');

    webrtc.sendFileInfo(connection, info);
    console.log('Sending a file info...', info);
  },

  _onPeerDCOutgoingConnectionError(event, data) {
    const { connection, error } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    switch (error.type) {
      case 'failed':
        peer.setProperties({
          'peer.connection': null,
          'peer.state': 'disconnected',
          state: 'error',
          errorCode: 'connection-failed',
        });
        break;
      default:
        break;
    }
  },

  _onPeerP2PDisconnected(event, data) {
    const { connection } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    if (peer) {
      peer.set('peer.connection', null);
      peer.set('peer.state', 'disconnected');
    }
  },

  _onPeerP2PFileInfo(event, data) {
    console.log('Peer:\t Received file info', data);

    const { connection, info } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    peer.set('transfer.info', info);
    peer.set('state', 'received_file_info');
  },

  _onPeerP2PFileResponse(event, data) {
    console.log('Peer:\t Received file response', data);

    const { connection, response } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);
    const webrtc = this.get('webrtc');

    if (response) {
      const file = peer.get('transfer.file');

      connection.on('sending_progress', (progress) => {
        peer.set('transfer.sendingProgress', progress);
      });
      webrtc.sendFile(connection, file);
      peer.set('state', 'receiving_file_data');
    } else {
      peer.set('state', 'declined_file_transfer');
    }
  },

  _onPeerP2PFileCanceled(event, data) {
    const { connection } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    connection.close();
    peer.set('transfer.receivingProgress', 0);
    peer.set('transfer.info', null);
    peer.set('state', 'idle');
  },

  _onPeerP2PFileReceived(event, data) {
    console.log('Peer:\t Received file', data);

    const { connection } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    connection.close();
    peer.set('transfer.receivingProgress', 0);
    peer.set('transfer.info', null);
    peer.set('state', 'idle');
    peer.trigger('didReceiveFile');
  },

  _onPeerP2PFileSent(event, data) {
    console.log('Peer:\t Sent file', data);

    const { connection } = data;
    const peers = this.get('model');
    const peer = peers.findBy('peer.id', connection.peer);

    peer.set('transfer.sendingProgress', 0);
    peer.set('transfer.file', null);
    peer.set('state', 'idle');
    peer.trigger('didSendFile');
  },
});
