import Peer from './peer';

const User = Peer.extend({
  serialize() {
    const data = {
      uuid: this.uuid,
      public_ip: this.public_ip,
      label: this.label,
      avatarUrl: this.avatarUrl,
      peer: {
        id: this.get('peer.id'),
      },
    };

    return data;
  },
});

export default User;
