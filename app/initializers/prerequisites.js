/* jshint -W030 */
import $ from 'jquery';
import { Promise } from 'rsvp';
import config from 'share-drop/config/environment';

import FileSystem from '../services/file';
import Analytics from '../services/analytics';

export function initialize(application) {
  function checkWebRTCSupport() {
    return new Promise((resolve, reject) => {
      // window.util is a part of PeerJS library
      if (window.util.supports.sctp) {
        resolve();
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('browser-unsupported');
      }
    });
  }

  function clearFileSystem() {
    return new Promise((resolve, reject) => {
      // TODO: change File into a service and require it here
      FileSystem.removeAll()
        .then(() => {
          resolve();
        })
        .catch(() => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('filesystem-unavailable');
        });
    });
  }

  function authenticateToFirebase() {
    return new Promise((resolve, reject) => {
      const xhr = $.getJSON('/auth');
      xhr.then((data) => {
        const ref = new window.Firebase(config.FIREBASE_URL);
        // eslint-disable-next-line no-param-reassign
        application.ref = ref;
        // eslint-disable-next-line no-param-reassign
        application.userId = data.id;
        // eslint-disable-next-line no-param-reassign
        application.publicIp = data.public_ip;

        ref.authWithCustomToken(data.token, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    });
  }

  // TODO: move it to a separate initializer
  function trackSizeOfReceivedFiles() {
    $.subscribe('file_received.p2p', (event, data) => {
      Analytics.trackEvent(
        'file',
        'received',
        'size',
        Math.round(data.info.size / 1000)
      );
    });
  }

  application.deferReadiness();

  checkWebRTCSupport()
    .then(clearFileSystem)
    .catch((error) => {
      // eslint-disable-next-line no-param-reassign
      application.error = error;
    })
    .then(authenticateToFirebase)
    .then(trackSizeOfReceivedFiles)
    .then(() => {
      application.advanceReadiness();
    });
}

export default {
  name: 'prerequisites',
  initialize,
};
