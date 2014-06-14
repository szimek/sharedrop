ShareDrop.App.AboutRoomView = Ember.View.extend({
    currentURL: function () {
        return window.location.href;
    }.property()
});
