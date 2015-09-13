import Ember from 'ember';

var equal = Ember.computed.equal;

export default Ember.Component.extend({
    classNames: ['peer'],
    classNameBindings: ['peer.peer.state'],

    peer: null,
    hasCustomRoomName: false,
    webrtc: null, // TODO inject webrtc as a service

    isIdle: equal('peer.state', 'idle'),
    isAwaitingFileInfo: equal('peer.state', 'awaiting_file_info'),
    isAwaitingResponse: equal('peer.state', 'awaiting_response'),
    hasReceivedFileInfo: equal('peer.state', 'received_file_info'),
    hasDeclinedFileTransfer: equal('peer.state', 'declined_file_transfer'),
    hasError: equal('peer.state', 'error'),

    filename: function () {
        const file = this.get('peer.transfer.file');
        const info = this.get('peer.transfer.info');

        if (file) { return file.name; }
        if (info) { return info.name; }

        return null;
    }.property('peer.transfer.file', 'peer.transfer.info'),

    actions: {
        // TODO: rename to something more meaningful (e.g. askIfWantToSendFile)
        uploadFile: function (data) {
            const peer = this.get('peer');
            const file = data.file;

            // Cache the file, so that it's available
            // when the response from the recipient comes in
            peer.set('transfer.file', file);
            peer.set('state', 'awaiting_file_info');
        },

        sendFileTransferInquiry: function () {
            const webrtc = this.get('webrtc');
            const peer = this.get('peer');

            webrtc.connect(peer.get('peer.id'));
        },

        cancelFileTransfer: function () {
            this._cancelFileTransfer();
        },

        abortFileTransfer: function () {
            this._cancelFileTransfer();

            const webrtc = this.get('webrtc');
            const connection = this.get('peer.peer.connection');

            webrtc.sendCancelRequest(connection);
        },

        acceptFileTransfer: function () {
            const peer = this.get('peer');

            this._sendFileTransferResponse(true);

            peer.get('peer.connection').on('receiving_progress', function (progress) {
                peer.set('transfer.receivingProgress', progress);
            });
            peer.set('state', 'sending_file_data');
        },

        rejectFileTransfer: function () {
            const peer = this.get('peer');

            this._sendFileTransferResponse(false);
            peer.set('transfer.info', null);
            peer.set('state', 'idle');
        }
    },

    _cancelFileTransfer: function () {
        const peer = this.get('peer');

        peer.setProperties({
            'transfer.file': null,
            'state': 'idle'
        });
    },

    _sendFileTransferResponse: function (response) {
        const webrtc = this.get('webrtc');
        const peer = this.get('peer');
        const connection = peer.get('peer.connection');

        webrtc.sendFileResponse(connection, response);
    },

    errorTemplateName: function () {
        const errorCode = this.get('peer.errorCode');

        return errorCode ? 'errors/popovers/' + errorCode : null;
    }.property('peer.errorCode'),

    label: function () {
        if (this.get('hasCustomRoomName')) {
            return this.get('peer.labelWithPublicIp');
        } else {
            return this.get('peer.label');
        }
    }.property('hasCustomRoomName', 'peer.label', 'peer.labelWithPublicIp')
});
