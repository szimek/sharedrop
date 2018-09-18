import Controller from '@ember/controller';
import User from '../models/user';
import $ from 'jquery';

export default Controller.extend({
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
    },

    actions: {
        redirect: function () {
            var uuid = $.uuid(),
                key = 'show-instructions-for-room-' + uuid;

            sessionStorage.setItem(key, 'yup');
            this.transitionToRoute('room', uuid);
        }
    },
});
