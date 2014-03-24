ShareDrop.App.ModalDialogComponent = Ember.Component.extend({
    actions: {
        close: function() {
            return this.sendAction();
        }
    }
});
