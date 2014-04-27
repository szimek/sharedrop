ShareDrop.App.PeerView = Ember.View.extend({
    peer: Ember.computed.alias('controller.model'),
    classNames: ['peer'],
    classNameBindings: ['peer.peer.state'],

    isIdle: Ember.computed.equal('peer.state', 'idle'),
    isAwaitingFileInfo: Ember.computed.equal('peer.state', 'awaiting_file_info'),
    isAwaitingResponse: Ember.computed.equal('peer.state', 'awaiting_response'),
    hasReceivedFileInfo: Ember.computed.equal('peer.state', 'received_file_info'),
    hasDeclinedFileTransfer: Ember.computed.equal('peer.state', 'declined_file_transfer'),
    hasError: Ember.computed.equal('peer.state', 'error'),

    errorTemplateName: function () {
        var errorCode = this.get('peer.errorCode');
        return errorCode ? 'errors/popovers/' + errorCode : null;
    }.property('peer.errorCode'),

    label: function () {
        if (this.get('controller.hasCustomRoomName')) {
            return this.get('peer.labelWithPublicIp');
        } else {
            return this.get('peer.label');
        }
    }.property('controller.hasCustomRoomName', 'peer.label', 'peer.labelWithPublicIp')
});
