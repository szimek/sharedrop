window.FileDrop.App = Ember.Application.create();

// Test for browser support
FileDrop.App.deferReadiness();
if (!(('webkitRTCPeerConnection' in window) && util.supports.sctp)) {
    alert("Your browser is not supported");
} else {
    FileDrop.App.advanceReadiness();
}

// Try to clear HTML5 filesystem on page load
// If it fails, it might mean that incognito mode is used
FileDrop.App.deferReadiness();
FileDrop.File.removeAll()
.then(function () {
    console.log("Cleared HTML5 filesystem");
    FileDrop.App.advanceReadiness();
})
.catch(function (error) {
    alert("This app doesn't work in incognito mode");
});
