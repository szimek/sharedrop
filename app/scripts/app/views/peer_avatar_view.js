FileDrop.PeerAvatarView = Ember.View.extend(Ember.ViewTargetActionSupport, {
    tagName: 'img',
    classNames: ['gravatar', 'img-circle'],
    attributeBindings: [
        'src',
        'alt',
        'title',
        'data-sending-progress',
        'data-receiving-progress'
    ],
    src: Ember.computed.alias('controller.model.avatarUrl'),
    alt: Ember.computed.alias('controller.model.label'),
    title: Ember.computed.alias('controller.model.uuid'),
    "data-sending-progress": Ember.computed.alias('controller.model.transfer.sendingProgress'),
    "data-receiving-progress": Ember.computed.alias('controller.model.transfer.receivingProgress'),

    // Delegate click to hidden file field in peer template
    click: function (event) {
        if (this.canSendFile()) {
            this.$().parent().find('input[type=file]').click();
        }
    },

    // Handle drop events
    dragEnter: function (event) {
        this.cancelEvent(event);
    },

    dragOver: function (event) {
        this.cancelEvent(event);
    },

    drop: function (event) {
        this.cancelEvent(event);

        var you = this.get('controller.controllers.index.you'),
            peer = this.get('controller.model'),
            dt = event.originalEvent.dataTransfer,
            files = dt.files,
            file = files[0];

        if (this.canSendFile()) {
            this.triggerAction({
                action: 'uploadFile',
                actionContext: {
                    file: file
                }
            });
        }
    },

    cancelEvent: function (event) {
        event.stopPropagation();
        event.preventDefault();
    },

    canSendFile: function () {
        var you = this.get('controller.controllers.index.you'),
            peer = this.get('controller.model');

        // Can't send files to disconnected peer
        if (!you.get('isConnected') || !peer.get('isConnected')) return false;

        // Can't send files if another file transfer is already in progress
        if (peer.get('transfer.file') || peer.get('transfer.info')) return false;

        return true;
    }
});
