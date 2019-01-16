import Controller from '@ember/controller';
import $ from 'jquery';

import User from '../models/user';

export default Controller.extend({
  init() {
    this._super();

    const id = window.ShareDrop.userId;
    const ip = window.ShareDrop.publicIp;
    const you = User.create({
      uuid: id,
      public_ip: ip,
      email: localStorage.email || null,
    });

    you.set('peer.id', id);
    this.set('you', you);
  },

  actions: {
    redirect() {
      const uuid = $.uuid();
      const key = `show-instructions-for-room-${uuid}`;

      sessionStorage.setItem(key, 'yup');
      this.transitionToRoute('room', uuid);
    },
  },
});
