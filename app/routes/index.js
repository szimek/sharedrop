import Route from '@ember/routing/route';
import $ from 'jquery';

import Room from '../services/room';

export default Route.extend({
  beforeModel() {
    const { error } = window.ShareDrop;

    if (error) {
      throw new Error(error);
    }
  },

  model() {
    // Get room name from the server
    return $.getJSON('/room').then((data) => data.name);
  },

  setupController(ctrl, model) {
    ctrl.set('model', []);
    ctrl.set('hasCustomRoomName', false);

    // Handle room events
    $.subscribe('connected.room', ctrl._onRoomConnected.bind(ctrl));
    $.subscribe('disconnected.room', ctrl._onRoomDisconnected.bind(ctrl));
    $.subscribe('user_added.room', ctrl._onRoomUserAdded.bind(ctrl));
    $.subscribe('user_changed.room', ctrl._onRoomUserChanged.bind(ctrl));
    $.subscribe('user_removed.room', ctrl._onRoomUserRemoved.bind(ctrl));

    // Handle peer events
    $.subscribe(
      'incoming_peer_connection.p2p',
      ctrl._onPeerP2PIncomingConnection.bind(ctrl)
    );
    $.subscribe(
      'incoming_dc_connection.p2p',
      ctrl._onPeerDCIncomingConnection.bind(ctrl)
    );
    $.subscribe(
      'incoming_dc_connection_error.p2p',
      ctrl._onPeerDCIncomingConnectionError.bind(ctrl)
    );
    $.subscribe(
      'outgoing_peer_connection.p2p',
      ctrl._onPeerP2POutgoingConnection.bind(ctrl)
    );
    $.subscribe(
      'outgoing_dc_connection.p2p',
      ctrl._onPeerDCOutgoingConnection.bind(ctrl)
    );
    $.subscribe(
      'outgoing_dc_connection_error.p2p',
      ctrl._onPeerDCOutgoingConnectionError.bind(ctrl)
    );
    $.subscribe('disconnected.p2p', ctrl._onPeerP2PDisconnected.bind(ctrl));
    $.subscribe('info.p2p', ctrl._onPeerP2PFileInfo.bind(ctrl));
    $.subscribe('response.p2p', ctrl._onPeerP2PFileResponse.bind(ctrl));
    $.subscribe('file_canceled.p2p', ctrl._onPeerP2PFileCanceled.bind(ctrl));
    $.subscribe('file_received.p2p', ctrl._onPeerP2PFileReceived.bind(ctrl));
    $.subscribe('file_sent.p2p', ctrl._onPeerP2PFileSent.bind(ctrl));

    // Join the room
    const room = new Room(model, window.ShareDrop.ref);
    room.join(ctrl.get('you').serialize());
    ctrl.set('room', room);
  },

  renderTemplate() {
    this.render();

    this.render('about_you', {
      into: 'application',
      outlet: 'about_you',
    });

    const key = 'show-instructions-for-app';
    if (!localStorage.getItem(key)) {
      this.send('openModal', 'about_app');
      localStorage.setItem(key, 'yup');
    }
  },

  actions: {
    willTransition() {
      $.unsubscribe('.room');
      $.unsubscribe('.p2p');

      this.controllerFor('index')
        .get('room')
        .leave();

      return true;
    },
  },
});
