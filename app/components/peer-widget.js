import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias, equal } from '@ember/object/computed';

export default Component.extend({
  classNames: ['peer'],
  classNameBindings: ['peer.peer.state'],

  peer: null,
  hasCustomRoomName: false,
  webrtc: null, // TODO inject webrtc as a service

  label: alias('peer.label'),

  isIdle: equal('peer.state', 'idle'),
  hasSelectedFile: equal('peer.state', 'has_selected_file'),
  isSendingFileInfo: equal('peer.state', 'sending_file_info'),
  isAwaitingFileInfo: equal('peer.state', 'awaiting_file_info'),
  isAwaitingResponse: equal('peer.state', 'awaiting_response'),
  hasReceivedFileInfo: equal('peer.state', 'received_file_info'),
  hasDeclinedFileTransfer: equal('peer.state', 'declined_file_transfer'),
  hasError: equal('peer.state', 'error'),

  filename: computed('peer.transfer.{file,info}', function() {
    const file = this.get('peer.transfer.file');
    const info = this.get('peer.transfer.info');

    if (file) {
      return file.name;
    }
    if (info) {
      return info.name;
    }

    return null;
  }),

  actions: {
    // TODO: rename to something more meaningful (e.g. askIfWantToSendFile)
    uploadFile(data) {
      const peer = this.get('peer');
      const { file } = data;

      // Cache the file, so that it's available
      // when the response from the recipient comes in
      peer.set('transfer.file', file);
      peer.set('state', 'has_selected_file');
    },

    sendFileTransferInquiry() {
      const webrtc = this.get('webrtc');
      const peer = this.get('peer');

      webrtc.connect(peer.get('peer.id'));
      peer.set('state', 'establishing_connection');
    },

    cancelFileTransfer() {
      this._cancelFileTransfer();
    },

    abortFileTransfer() {
      this._cancelFileTransfer();

      const webrtc = this.get('webrtc');
      const connection = this.get('peer.peer.connection');

      webrtc.sendCancelRequest(connection);
    },

    acceptFileTransfer() {
      const peer = this.get('peer');

      this._sendFileTransferResponse(true);

      peer.get('peer.connection').on('receiving_progress', (progress) => {
        peer.set('transfer.receivingProgress', progress);
      });
      peer.set('state', 'sending_file_data');
    },

    rejectFileTransfer() {
      const peer = this.get('peer');

      this._sendFileTransferResponse(false);
      peer.set('transfer.info', null);
      peer.set('state', 'idle');
    },
  },

  _cancelFileTransfer() {
    const peer = this.get('peer');

    peer.setProperties({
      'transfer.file': null,
      state: 'idle',
    });
  },

  _sendFileTransferResponse(response) {
    const webrtc = this.get('webrtc');
    const peer = this.get('peer');
    const connection = peer.get('peer.connection');

    webrtc.sendFileResponse(connection, response);
  },

  errorTemplateName: computed('peer.errorCode', function() {
    const errorCode = this.get('peer.errorCode');

    return errorCode ? `errors/popovers/${errorCode}` : null;
  }),
});
