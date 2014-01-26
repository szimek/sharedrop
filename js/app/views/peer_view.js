FileDrop.PeerView = Ember.View.extend({
    isConnected: Ember.computed.alias('controller.model.isConnected'),
    classNames: ['media', 'peer'],
    classNameBindings: ['isConnected:connected:disconnected'],

    // Handle drop events
    dragEnter: function (event) {
        this.cancelEvent(event);
    },

    dragOver: function (event) {
        this.cancelEvent(event);
    },

    drop: function (event) {
        this.cancelEvent(event);

        var _peer = this.get('controller._peer'),
            user = this.get('controller.controllers.index.user'),
            peer = this.get('controller.model'),
            connection = peer.get('peer.connection'),
            dt = event.originalEvent.dataTransfer,
            files = dt.files,
            file = files[0];

        // Can't send files to yourself.
        if (user.get('uuid') === peer.get('uuid')) return;

        console.log('Sending a file...');

        // Store file, so it's available when a response from the recipient comes in.
        peer.set('peer.file', file);

        var response = window.confirm('Do you want to send "' + file.name + '" to "' + peer.get('label') + '"?');
        if (response) {
            _peer.sendFileInfo(connection, file);
        }
    },

    cancelEvent: function (event) {
        event.stopPropagation();
        event.preventDefault();
    }
});
