ShareDrop.App.PeerView = Ember.View.extend({
    peer: Ember.computed.alias('controller.model'),
    isConnected: Ember.computed.alias('peer.isConnected'),
    classNames: ['peer'],
    classNameBindings: ['isConnected:connected:disconnected'],

    // TODO: figure out a shorter way to define these
    isIdle: Ember.computed.equal('peer.internalState', 'idle'),
    isAwaitingFileInfo: Ember.computed.equal('peer.internalState', 'awaiting_file_info'),
    isAwaitingResponse: Ember.computed.equal('peer.internalState', 'awaiting_response'),
    hasReceivedFileInfo: Ember.computed.equal('peer.internalState', 'received_file_info'),
    hasDeclinedFileTransfer: Ember.computed.equal('peer.internalState', 'declined_file_transfer')
});
