import IndexRoute from './index';

export default IndexRoute.extend({
    controllerName: 'index',

    model: function (params) {
        // Get room name from params
        return params.room_id;
    },

    afterModel: function (model, transition) {
        transition.then(function (route) {
            route.controllerFor('application').set('currentUrl', window.location.href);
        });
    },

    setupController: function (ctrl, model) {
        this._super(ctrl, model);

        ctrl.set('hasCustomRoomName', true);
    },

    renderTemplate: function (ctrl) {
        this.render('index');

        this.render('about_you', {
            into: 'application',
            outlet: 'about_you'
        });

        var room = ctrl.get('room').name,
            key = 'show-instructions-for-room-' + room;

        if (sessionStorage.getItem(key)) {
            this.send('openModal', 'about_room');
            sessionStorage.removeItem(key);
        }
    }
});
