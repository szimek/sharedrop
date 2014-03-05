// Clear HTML5 filesystem on page load
FileDrop.deferReadiness();
FileDrop.File.removeAll().then(function () {
    console.log("Cleared HTML5 filesystem");
    FileDrop.advanceReadiness();
});
