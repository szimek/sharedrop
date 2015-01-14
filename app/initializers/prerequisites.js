import Ember from 'ember';
import config from 'share-drop/config/environment';
import FileSystem from '../services/file';
import Analytics from '../services/analytics';

export function initialize(container, application) {
    application.deferReadiness();

    checkWebRTCSupport()
    .then(clearFileSystem)
    .catch(function (error) {
        application.error = error;
    })
    .then(authenticateToFirebase)
    .then(trackSizeOfReceivedFiles)
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

    // TODO: move it to a separate initializer
    function trackSizeOfReceivedFiles() {
        Ember.$.subscribe('file_received.p2p', function (event, data) {
            Analytics.trackEvent('file', 'received', 'size', Math.round(data.info.size / 1000));
        });
    }
}

export default {
    name: 'prerequisites',
    initialize: initialize
};
