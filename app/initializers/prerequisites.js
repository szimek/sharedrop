import Ember from 'ember';
import config from 'ShareDrop/config/environment';
import FileSystem from '../services/file';

export function initialize(container, application) {
    application.deferReadiness();

    checkWebRTCSupport()
    .then(clearFileSystem)
    .catch(function (error) {
        application.error = error;
    })
    .then(authenticateToFirebase)
    .then(function () {
        application.advanceReadiness();
    });

    function checkWebRTCSupport() {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            // window.util is a part of PeerJS library
            if (window.util.supports.sctp) {
                resolve();
            } else {
                reject('browser-unsupported');
            }
        });
    }

    function clearFileSystem() {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            // TODO: change File into a service and require it here
            FileSystem.removeAll()
            .then(function () {
                resolve();
            })
            .catch(function () {
                reject('filesystem-unavailable');
            });
        });
    }

    function authenticateToFirebase() {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var xhr = Ember.$.getJSON('/auth');
            xhr.then(function (data) {
                var ref = new window.Firebase(config.FIREBASE_URL);
                application.ref = ref;
                application.userId = data.id;
                application.publicIp = data.public_ip;

                ref.authWithCustomToken(data.token, function (error) {
                    error ? reject(error) : resolve();
                });
            });
        });
    }
}

export default {
    name: 'prerequisites',
    initialize: initialize
};
