FileDrop.PeerView = Ember.View.extend({
    isConnected: Ember.computed.alias('controller.model.isConnected'),
    classNames: ['peer'],
    classNameBindings: ['isConnected:connected:disconnected'],

    showLocalIP: function () {
        return this.get('controller.model.label') !== this.get('controller.model.local_ip');
    }.property('controller.model.label', 'controller.model.local_ip')
});
