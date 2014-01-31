FileDrop.ApplicationController = Ember.Controller.extend({
    init: function () {
        this._super();

        var user = FileDrop.Peer.create({
            email: localStorage.email || null,
            label: 'You'
        });

        this.set('user', user);
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
            loggedInUser: this.get('user.email'),

            onlogin: function (assertion) {
                $.ajax({
                    type: 'POST',
                    url: '/persona/verify',
                    data: { assertion: assertion },
                    success: function (res, status, xhr) {
                        console.log('Persona: Signed in as: "' + res.email + '"');

                        if (res && res.status === "okay") {
                            self.set('user.email', res.email);
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
                        self.set('user.email', null);
                    },
                    error: function(xhr, status, err) {
                        console.log('Persona: Sign out error: ', err);
                    }
                });
            }
        });
    },

    // Store user's email in localStorage
    userEmailDidChange: function () {
        var email = this.get('user.email');

        if (email) {
            localStorage.email = email;
        } else {
            localStorage.removeItem('email');
        }
    }.observes('user.email')
});
