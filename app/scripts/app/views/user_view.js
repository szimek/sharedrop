ShareDrop.App.UserView = Ember.View.extend({
    isConnected: Ember.computed.alias('controller.model.isConnected'),
    classNames: ['peer'],
    classNameBindings: ['isConnected:connected:disconnected']
});
