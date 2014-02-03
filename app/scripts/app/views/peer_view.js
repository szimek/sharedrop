FileDrop.PeerView = Ember.View.extend({
    classNames: ['peer'],
    classNameBindings: ['isConnected:connected:disconnected'],

    isConnected: Ember.computed.alias('controller.model.isConnected'),

    showLocalIP: function () {
        return this.get('controller.model.label') !== this.get('controller.model.local_ip');
    }.property('controller.model.label', 'controller.model.local_ip')
});
