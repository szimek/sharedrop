window.FileDrop.App = Ember.Application.create();

// Clear HTML5 filesystem on page load
FileDrop.App.deferReadiness();
FileDrop.File.removeAll().then(function () {
    console.log("Cleared HTML5 filesystem");
    FileDrop.App.advanceReadiness();
});
