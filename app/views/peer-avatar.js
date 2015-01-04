import Ember from 'ember';

var alias = Ember.computed.alias;

export default Ember.View.extend(Ember.ViewTargetActionSupport, {
    tagName: 'img',
    classNames: ['gravatar'],
    attributeBindings: [
        'src',
        'alt',
        'title',
        'data-sending-progress',
        'data-receiving-progress'
    ],
    peer: alias('controller.model'),
    src: alias('peer.avatarUrl'),
    alt: alias('peer.label'),
    title: alias('peer.uuid'),
    "data-sending-progress": alias('peer.transfer.sendingProgress'),
    "data-receiving-progress": alias('peer.transfer.receivingProgress'),

    didInsertElement: function () {
        var self = this,
            peer = this.get('peer'),
            toggleTransferCompletedClass = function () {
                var klass = 'transfer-completed';

                Ember.run.later(self, function () {
                    this.$().parent('.avatar')
                    .addClass(klass)
                    .delay(2000)
                    .queue(function () {
                        Ember.$(this).removeClass(klass).dequeue();
                    });
                }, 250);
            };

        peer.on('didReceiveFile', toggleTransferCompletedClass);
        peer.on('didSendFile', toggleTransferCompletedClass);

        this._super();
    },

    willDestroyElement: function () {
        var peer = this.get('peer');

        peer.off('didReceiveFile');
        peer.off('didSendFile');
    },

    // Delegate click to hidden file field in peer template
    click: function () {
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

    dragLeave: function () {
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
                    state: 'error',
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
        if (peer.get('transfer.file') || peer.get('transfer.info')) {
            return false;
        }

        return true;
    },

    isFile: function (file) {
        return new Promise(function (resolve, reject) {
            if (file instanceof window.File) {
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
