ShareDrop.App.PeerAvatarView = Ember.View.extend(Ember.ViewTargetActionSupport, {
    tagName: 'img',
    classNames: ['gravatar', 'img-circle'],
    attributeBindings: [
        'src',
        'alt',
        'title',
        'data-sending-progress',
        'data-receiving-progress'
    ],
    peer: Ember.computed.alias('controller.model'),
    src: Ember.computed.alias('peer.avatarUrl'),
    alt: Ember.computed.alias('peer.label'),
    title: Ember.computed.alias('peer.uuid'),
    "data-sending-progress": Ember.computed.alias('peer.transfer.sendingProgress'),
    "data-receiving-progress": Ember.computed.alias('peer.transfer.receivingProgress'),

    // Delegate click to hidden file field in peer template
    click: function (event) {
        if (this.canSendFile()) {
            this.$().closest('.peer').find('input[type=file]').click();
        }
    },

    // Handle drop events
    dragEnter: function (event) {
        this.cancelEvent(event);

        this.$().parent('.avatar').addClass('hover');
    },

    dragOver: function (event) {
        this.cancelEvent(event);
    },

    dragLeave: function (event) {
        this.$().parent('.avatar').removeClass('hover');
    },

    drop: function (event) {
        this.cancelEvent(event);

        this.$().parent('.avatar').removeClass('hover');

        var self = this,
            peer = this.get('peer'),
            dt = event.originalEvent.dataTransfer,
            files = dt.files,
            file = files[0];

        if (this.canSendFile()) {
            if (files.length > 1) {
                peer.setProperties({
                    internalState: 'error',
                    errorCode: 'multiple_files'
                });
            } else {
                this.isFile(file).then(function () {
                    self.triggerAction({
                        action: 'uploadFile',
                        actionContext: {
                            file: file
                        }
                    });
                });
            }
        }
    },

    cancelEvent: function (event) {
        event.stopPropagation();
        event.preventDefault();
    },

    canSendFile: function () {
        var peer = this.get('controller.model');

        // Can't send files if another file transfer is already in progress
        if (peer.get('transfer.file') || peer.get('transfer.info')) return false;

        return true;
    },

    isFile: function (file) {
        return new Promise(function (resolve, reject) {
            if (file instanceof File) {
                if (file.size > 1048576) {
                    // It's bigger than 1MB, so we assume it's a file
                    resolve();
                } else {
                    // Try to read it using FileReader - if it's not a file,
                    // it should trigger onerror handler
                    var reader = new FileReader();
                    reader.onload = function () { resolve(); };
                    reader.onerror = function () { reject(); };
                    reader.readAsArrayBuffer(file);
                }
            } else {
                reject();
            }
        });
    }
});
