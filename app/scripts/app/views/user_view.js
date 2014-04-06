ShareDrop.App.UserView = Ember.View.extend({
    classNames: ['peer'],
    classNameBindings: ['isConnected:connected:disconnected'],
    isConnected: Ember.computed.alias('controller.model.isConnected'),
    localIps: function () {
        // Convert unordered set to sorted array
        var ips = this.get('controller.model.local_ips');
        return ips.toArray().sort();
    }.property('controller.model.local_ips.[]')
});
