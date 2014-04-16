ShareDrop.App.UserController = Ember.ObjectController.extend({
    needs: 'index',
    hasCustomRoomName: Ember.computed.alias('controllers.index.hasCustomRoomName')
});
