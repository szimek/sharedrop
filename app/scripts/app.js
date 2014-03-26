window.ShareDrop.App = Ember.Application.create();

ShareDrop.App.deferReadiness();

// Check if everything we need is available
(function () {
    checkWebRTCSupport()
    .then(clearFileSystem)
    .catch(function (error) {
        ShareDrop.App.error = error;
    })
    .then(authenticateToFirebase)
    .then(function () {
        ShareDrop.App.advanceReadiness();
    });

    function checkWebRTCSupport() {
        return new Promise(function (resolve, reject) {
            if (util.supports.sctp) {
                resolve();
            } else {
                reject('browser_unsupported');
            }
        });
    }

    function clearFileSystem() {
        return new Promise(function (resolve, reject) {
            ShareDrop.File.removeAll()
            .then(function () {
                resolve();
            })
            .catch(function () {
                reject('filesystem_unavailable');
            });
        });
    }

    function authenticateToFirebase() {
        return new Promise(function (resolve, reject) {
            var xhr = Ember.$.getJSON('/auth');
            xhr.then(function (data) {
                var ref = new Firebase(window.ENV.FIREBASE_URL);
                ShareDrop.App.ref = ref;
                ShareDrop.App.userId = data.id;

                ref.auth(data.token, function (error) {
                    error ? reject(error) : resolve();
                });
            });
        });
    }
})();

ShareDrop.App.ApplicationRoute = Ember.Route.extend({
    actions: {
        openModal: function (modalName) {
            return this.render(modalName, {
                outlet: 'modal',
                into: 'index'
            });
        },

        closeModal: function () {
            return this.disconnectOutlet({
                outlet: 'modal',
                parentView: 'index'
            });
        }
    }
});

ShareDrop.App.IndexRoute = Ember.Route.extend({
    beforeModel: function() {
        if (ShareDrop.App.error) {
            throw new Error(ShareDrop.App.error);
        }
    },

    renderTemplate: function () {
        this.render();

        this.render('about_you', {
            into: 'application',
            outlet: 'about_you'
        });

        if (!localStorage.seenInstructions) {
            this.send('openModal', 'about');
            localStorage.seenInstructions = 'yup';
        }
    }
});

ShareDrop.App.ErrorRoute = Ember.Route.extend({
    renderTemplate: function(controller, error) {
        var name = 'errors/' + error.message,
            template = Ember.TEMPLATES[name];

        if (template) this.render(name);
    }
});
