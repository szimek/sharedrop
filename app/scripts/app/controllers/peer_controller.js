FileDrop.PeerController = Ember.ObjectController.extend({
    needs: 'index',

    _peer: Ember.computed.alias('controllers.index._peer'),

    actions: {
        // TODO: rename to something more meaningful (e.g. askIfWantToSendFile)
        uploadFile: function (data) {
            var peer = this.get('model');

            // Make file available when the response from the recipient comes in
            peer.set('transfer.file', data.file);
        },

        sendFileTransferInquiry: function () {
            var _peer = this.get('_peer'),
                peer = this.get('model'),
                connection = peer.get('peer.connection'),
                file = peer.get('transfer.file');

            _peer.sendFileInfo(connection, file);

            console.log('Sending a file...', file);
        },

        cancelFileTransfer: function () {
            var peer = this.get('model');
            peer.set('transfer.file', null);
        },

        acceptFileTransfer: function () {
            this._sendFileTransferResponse(true);
        },

        rejectFileTransfer: function () {
            this._sendFileTransferResponse(false);
        }
    },

    _sendFileTransferResponse: function (response) {
        var _peer = this.get('_peer'),
            peer = this.get('model'),
            connection = peer.get('peer.connection');

        _peer.sendFileResponse(connection, response);
    }
});
