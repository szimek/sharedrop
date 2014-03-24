ShareDrop.App.AboutController = Ember.Controller.extend({
  actions: {
    close: function() {
      return this.send('closeModal');
    }
  }
});
