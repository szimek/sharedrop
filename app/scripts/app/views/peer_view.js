ShareDrop.App.PeerView = Ember.View.extend({
    peer: Ember.computed.alias('controller.model'),
    isConnected: Ember.computed.alias('peer.isConnected'),
    classNames: ['peer'],
    classNameBindings: ['isConnected:connected:disconnected'],

    isIdle: Ember.computed.equal('peer.internalState', 'idle'),
    isAwaitingFileInfo: Ember.computed.equal('peer.internalState', 'awaiting_file_info'),
    isAwaitingResponse: Ember.computed.equal('peer.internalState', 'awaiting_response'),
    hasReceivedFileInfo: Ember.computed.equal('peer.internalState', 'received_file_info'),
    hasDeclinedFileTransfer: Ember.computed.equal('peer.internalState', 'declined_file_transfer'),
    hasError: Ember.computed.equal('peer.internalState', 'error'),

    errorTemplateName: function () {
        var errorCode = this.get('peer.errorCode');

        return errorCode ? 'errors/' + errorCode : null;
    }.property('peer.errorCode'),

    label: function () {
        if (this.get('controller.hasCustomRoomName')) {
            return this.get('peer.labelWithPublicIp');
        } else {
            return this.get('peer.label');
        }
    }.property('controller.hasCustomRoomName', 'peer.label', 'peer.labelWithPublicIp')
});
