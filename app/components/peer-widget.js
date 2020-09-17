import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias, equal } from '@ember/object/computed';
import JSZip from 'jszip';

function reduceFiles(files) {
  if (files.length === 1) {
    return Promise.resolve(files[0]);
  }

  const zip = new JSZip();
  Array.prototype.forEach.call(files, (file) => {
    zip.file(file.name, file);
  });

  return zip.generateAsync({ type: 'blob' }).then(
    (blob) =>
      new File(
        [blob],
        `sharedrop-${new Date()
          .toISOString()
          .substring(0, 19)
          .replace('T', '-')}.zip`,
        {
          type: 'application/zip',
        },
      ),
  );
}

export default Component.extend({
  classNames: ['peer'],
  classNameBindings: ['peer.peer.state'],

  peer: null,
  hasCustomRoomName: false,
  webrtc: null, // TODO inject webrtc as a service

  label: alias('peer.label'),

  isIdle: equal('peer.state', 'idle'),
  isPreparingFileTransfer: equal('peer.state', 'is_preparing_file_transfer'),
  hasSelectedFile: equal('peer.state', 'has_selected_file'),
  isSendingFileInfo: equal('peer.state', 'sending_file_info'),
  isAwaitingFileInfo: equal('peer.state', 'awaiting_file_info'),
  isAwaitingResponse: equal('peer.state', 'awaiting_response'),
  hasReceivedFileInfo: equal('peer.state', 'received_file_info'),
  hasDeclinedFileTransfer: equal('peer.state', 'declined_file_transfer'),
  hasError: equal('peer.state', 'error'),

  filename: computed('peer.transfer.{file,info}', function () {
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
      const { peer } = this;
      const { files } = data;

      peer.set('state', 'is_preparing_file_transfer');

      // Cache the file, so that it's available
      // when the response from the recipient comes in
      reduceFiles(files).then((file) => {
        peer.set('transfer.file', file);
        peer.set('state', 'has_selected_file');
      });
    },

    sendFileTransferInquiry() {
      const { webrtc } = this;
      const { peer } = this;

      webrtc.connect(peer.get('peer.id'));
      peer.set('state', 'establishing_connection');
    },

    cancelFileTransfer() {
      this._cancelFileTransfer();
    },

    abortFileTransfer() {
      this._cancelFileTransfer();

      const { webrtc } = this;
      const connection = this.get('peer.peer.connection');

      webrtc.sendCancelRequest(connection);
    },

    acceptFileTransfer() {
      const { peer } = this;

      this._sendFileTransferResponse(true);

      peer.get('peer.connection').on('receiving_progress', (progress) => {
        peer.set('transfer.receivingProgress', progress);
      });
      peer.set('state', 'sending_file_data');
    },

    rejectFileTransfer() {
      const { peer } = this;

      this._sendFileTransferResponse(false);
      peer.set('transfer.info', null);
      peer.set('state', 'idle');
    },
  },

  _cancelFileTransfer() {
    const { peer } = this;

    peer.setProperties({
      'transfer.file': null,
      state: 'idle',
    });
  },

  _sendFileTransferResponse(response) {
    const { webrtc } = this;
    const { peer } = this;
    const connection = peer.get('peer.connection');

    webrtc.sendFileResponse(connection, response);
  },

  errorTemplateName: computed('peer.errorCode', function () {
    const errorCode = this.get('peer.errorCode');

    return errorCode ? `errors/popovers/${errorCode}` : null;
  }),
});
