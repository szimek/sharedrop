window.FileDrop.App = Ember.Application.create();

FileDrop.App.deferReadiness();

// Check if everything we need is available
(function () {
    checkWebRTCSupport()
    .then(clearFileSystem)
    .catch(function (error) {
        FileDrop.App.error = error;
    })
    .then(function () {
        FileDrop.App.advanceReadiness();
    });

    function checkWebRTCSupport() {
        return new Promise(function (resolve, reject) {
            if (('webkitRTCPeerConnection' in window) && util.supports.sctp) {
                resolve();
            } else {
                reject('browser_unsupported');
            }
        });
    }

    function clearFileSystem() {
        return new Promise(function (resolve, reject) {
            FileDrop.File.removeAll()
            .then(function () {
                resolve();
            })
            .catch(function () {
                reject('filesystem_unavailable');
            });
        });
    }
})();

FileDrop.App.IndexRoute = Ember.Route.extend({
    beforeModel: function() {
        if (FileDrop.App.error) {
            throw new Error(FileDrop.App.error);
        }
    },

    renderTemplate: function () {
        this.render();

        this.render('about_you', {
            into: 'application',
            outlet: 'about_you'
        });
    }
});

FileDrop.App.ErrorRoute = Ember.Route.extend({
    renderTemplate: function(controller, error) {
        var name = 'errors/' + error.message,
            template = Ember.TEMPLATES[name];

        if (template) this.render(name);
    }
});
