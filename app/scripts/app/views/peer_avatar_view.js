FileDrop.PeerAvatarView = Ember.View.extend(Ember.ViewTargetActionSupport, {
    tagName: 'img',
    classNames: ['gravatar', 'img-circle'],
    attributeBindings: ['src', 'alt', 'title'],
    srcBinding: 'controller.model.avatarUrl',
    altBinding: 'controller.model.label',
    titleBinding: 'controller.model.uuid',

    // Delegate click to hidden file field
    click: function (event) {
        var user = this.get('controller.controllers.index.user'),
            peer = this.get('controller.model');

        // Can't send files to disconnected user.
        if (!peer.get('isConnected')) return;

        this.$().parent().find('input[type=file]').click();
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

        var user = this.get('controller.controllers.index.user'),
            peer = this.get('controller.model'),
            dt = event.originalEvent.dataTransfer,
            files = dt.files,
            file = files[0];

        // Can't send files to disconnected user.
        if (!peer.get('isConnected')) return;

        this.triggerAction('uploadFile', file);
    },

    cancelEvent: function (event) {
        event.stopPropagation();
        event.preventDefault();
    }
});
