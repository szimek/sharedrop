FileDrop.PeerController = Ember.ObjectController.extend({
    needs: 'index',

    webrtc: Ember.computed.alias('controllers.index.webrtc'),

    filename: function () {
        var file = this.get('model.transfer.file'),
            info = this.get('model.transfer.info');

        if (file) return file.name;
        if (info) return info.name;
        return null;
    }.property('model.transfer.file', 'model.transfer.info'),

    actions: {
        // TODO: rename to something more meaningful (e.g. askIfWantToSendFile)
        uploadFile: function (data) {
            var peer = this.get('model');

            // Make file available when the response from the recipient comes in
            peer.set('transfer.file', data.file);
        },

        sendFileTransferInquiry: function () {
            var webrtc = this.get('webrtc'),
                peer = this.get('model'),
                connection = peer.get('peer.connection'),
                file = peer.get('transfer.file');

            webrtc.sendFileInfo(connection, file);

            console.log('Sending a file...', file);
        },

        cancelFileTransfer: function () {
            var peer = this.get('model');
            peer.set('transfer.file', null);
        },

        acceptFileTransfer: function () {
            var peer = this.get('model');

            this._sendFileTransferResponse(true);
            peer.set('transfer.info', null);

            peer.get('peer.connection').on('receiving_progress', function (progress) {
                peer.set('transfer.receivingProgress', progress);
            });
        },

        rejectFileTransfer: function () {
            var peer = this.get('model');

            this._sendFileTransferResponse(false);
            peer.set('transfer.info', null);
        }
    },

    _sendFileTransferResponse: function (response) {
        var webrtc = this.get('webrtc'),
            peer = this.get('model'),
            connection = peer.get('peer.connection');

        webrtc.sendFileResponse(connection, response);
    }
});
