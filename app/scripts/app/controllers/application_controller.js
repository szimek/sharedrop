ShareDrop.App.ApplicationController = Ember.Controller.extend({
    init: function () {
        this._super();

        var you = ShareDrop.App.User.create({
            email: localStorage.email || null
        });

        this.set('you', you);
        this.handlePersonaAuth();
    },

    actions: {
        signIn: function () {
            navigator.id.request();
        },

        signOut: function () {
            navigator.id.logout();
        }
    },

    handlePersonaAuth: function () {
        var self = this;

        navigator.id.watch({
            loggedInUser: this.get('you.email'),

            onlogin: function (assertion) {
                $.ajax({
                    type: 'POST',
                    url: '/persona/verify',
                    data: { assertion: assertion },
                    success: function (res, status, xhr) {
                        console.log('Persona: Signed in as: "' + res.email + '"');

                        if (res && res.status === "okay") {
                            self.set('you.email', res.email);
                        }
                    },
                    error: function (xhr, status, err) {
                        console.log('Persona: Signed in error: ', err);
                        navigator.id.logout();
                    }
                });
            },

            onlogout: function () {
                $.ajax({
                    type: 'POST',
                    url: '/persona/logout',
                    success: function(res, status, xhr) {
                        console.log('Persona: Signed out');
                        self.set('you.email', null);
                    },
                    error: function(xhr, status, err) {
                        console.log('Persona: Sign out error: ', err);
                    }
                });
            }
        });
    }
});
