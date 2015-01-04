import Ember from 'ember';
import User from '../models/user';

export default Ember.Controller.extend({
    init: function () {
        this._super();

        var id = window.ShareDrop.userId,
            ip = window.ShareDrop.publicIp,
            you = User.create({
                uuid: id,
                public_ip: ip,
                email: localStorage.email || null
            });

        you.set('peer.id', id);
        this.set('you', you);
        this.handlePersonaAuth();
    },

    actions: {
        signIn: function () {
            navigator.id.request();
        },

        signOut: function () {
            navigator.id.logout();
        },

        redirect: function () {
            var uuid = Ember.$.uuid(),
                key = 'show-instructions-for-room-' + uuid;

            sessionStorage.setItem(key, 'yup');
            this.transitionToRoute('room', uuid);
        }
    },

    handlePersonaAuth: function () {
        var self = this;

        navigator.id.watch({
            loggedInUser: this.get('you.email'),

            onlogin: function (assertion) {
                Ember.$.ajax({
                    type: 'POST',
                    url: '/persona/verify',
                    data: { assertion: assertion },
                    success: function (res) {
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
                Ember.$.ajax({
                    type: 'POST',
                    url: '/persona/logout',
                    success: function () {
                        console.log('Persona: Signed out');
                        self.set('you.email', null);
                    },
                    error: function (xhr, status, err) {
                        console.log('Persona: Sign out error: ', err);
                    }
                });
            }
        });
    }
});
