import IndexRoute from './index';

export default IndexRoute.extend({
  controllerName: 'index',

  model(params) {
    // Get room name from params
    return params.room_id;
  },

  afterModel(model, transition) {
    transition.then((route) => {
      route
        .controllerFor('application')
        .set('currentUrl', window.location.href);
    });
  },

  setupController(ctrl, model) {
    // Call this method on "index" controller
    this._super(ctrl, model);

    ctrl.set('hasCustomRoomName', true);
  },

  renderTemplate(ctrl) {
    this.render('index');

    this.render('about_you', {
      into: 'application',
      outlet: 'about_you',
    });

    const room = ctrl.get('room').name;
    const key = `show-instructions-for-room-${room}`;

    if (sessionStorage.getItem(key)) {
      this.send('openModal', 'about_room');
      sessionStorage.removeItem(key);
    }
  },
});
