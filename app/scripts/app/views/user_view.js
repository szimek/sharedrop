FileDrop.UserView = Ember.View.extend({
    templateName: 'peer',
    isConnected: Ember.computed.alias('controller.model.isConnected'),
    classNames: ['peer'],
    classNameBindings: ['isConnected:connected:disconnected']
});
