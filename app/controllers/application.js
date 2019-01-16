import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import uuidv4 from 'uuid';

import User from '../models/user';

export default Controller.extend({
  avatarService: service('avatar'),

  init(...args) {
    this._super(args);

    const id = window.ShareDrop.userId;
    const ip = window.ShareDrop.publicIp;
    const avatar = this.avatarService.get();
    const you = User.create({
      uuid: id,
      public_ip: ip,
      avatarUrl: avatar.url,
      label: avatar.label,
    });

    you.set('peer.id', id);
    this.set('you', you);
  },

  actions: {
    redirect() {
      const uuid = uuidv4();
      const key = `show-instructions-for-room-${uuid}`;

      sessionStorage.setItem(key, 'yup');
      this.transitionToRoute('room', uuid);
    },
  },
});
