import Ember from 'ember';

var alias = Ember.computed.alias;

export default Ember.ObjectController.extend({
    needs: 'index',

    webrtc: alias('controllers.index.webrtc'),
    hasCustomRoomName: alias('controllers.index.hasCustomRoomName'),

    filename: function () {
        var file = this.get('model.transfer.file'),
            info = this.get('model.transfer.info');

        if (file) { return file.name; }
        if (info) { return info.name; }
        return null;
    }.property('model.transfer.file', 'model.transfer.info'),

    actions: {
        // TODO: rename to something more meaningful (e.g. askIfWantToSendFile)
        uploadFile: function (data) {
            var peer = this.get('model'),
                file = data.file;

            // Cache the file, so that it's available
            // when the response from the recipient comes in
            peer.set('transfer.file', file);
            peer.set('state', 'awaiting_file_info');
        },

        sendFileTransferInquiry: function () {
            var webrtc = this.get('webrtc'),
                peer = this.get('model');

            webrtc.connect(peer.get('peer.id'));
        },

        cancelFileTransfer: function () {
            this._cancelFileTransfer();
        },

        abortFileTransfer: function () {
            this._cancelFileTransfer();

            var webrtc = this.get('webrtc'),
                connection = this.get('model.peer.connection');

            webrtc.sendCancelRequest(connection);
        },

        acceptFileTransfer: function () {
            var peer = this.get('model');

            this._sendFileTransferResponse(true);

            peer.get('peer.connection').on('receiving_progress', function (progress) {
                peer.set('transfer.receivingProgress', progress);
            });
            peer.set('state', 'sending_file_data');
        },

        rejectFileTransfer: function () {
            var peer = this.get('model');

            this._sendFileTransferResponse(false);
            peer.set('transfer.info', null);
            peer.set('state', 'idle');
        }
    },

    _cancelFileTransfer: function () {
        var peer = this.get('model');

        peer.setProperties({
            'transfer.file': null,
            'state': 'idle'
        });
    },

    _sendFileTransferResponse: function (response) {
        var webrtc = this.get('webrtc'),
            peer = this.get('model'),
            connection = peer.get('peer.connection');

        webrtc.sendFileResponse(connection, response);
    }
});
