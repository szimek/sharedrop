import EmberRouter from '@ember/routing/router';
import config from 'sharedrop/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;

  rootURL = config.rootURL;
}

// eslint-disable-next-line array-callback-return
Router.map(function () {
  this.route('room', {
    path: '/rooms/:room_id',
  });
});
