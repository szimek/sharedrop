FileDrop.PeerController = Ember.ObjectController.extend({
    needs: 'index',

    _peer: Ember.computed.alias('controllers.index._peer'),
    fileToSend: null,
    fileToReceive: null
});
