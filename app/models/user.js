import Peer from './peer';

const User = Peer.extend({
  serialize() {
    const data = {
      uuid: this.get('uuid'),
      public_ip: this.get('public_ip'),
      label: this.get('label'),
      avatarUrl: this.get('avatarUrl'),
      peer: {
        id: this.get('peer.id'),
      },
    };

    return data;
  },
});

export default User;
