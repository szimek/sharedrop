FileDrop.PeerController = Ember.ObjectController.extend({
    needs: 'index',

    _peer: Ember.computed.alias('controllers.index._peer'),

    actions: {
        uploadFile: function (file) {
            var _peer = this.get('_peer'),
                peer = this.get('model'),
                connection = peer.get('peer.connection');

            // Store file, so it's available when the response from the recipient comes in
            peer.set('peer.file', file);

            var response = window.confirm('Do you want to send "' + file.name + '" to "' + peer.get('label') + '"?');
            if (response) {
                _peer.sendFileInfo(connection, file);
            }
        }
    }
});
