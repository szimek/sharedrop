import { computed, observer } from '@ember/object';
import Peer from './peer';

export default Peer.extend({
  init() {
    this.set('local_ips', []);
    this._super();
  },

  local_ip: computed('local_ips.[]', {
    get() {
      const ips = this.get('local_ips');
      const storedIp = localStorage.getItem('local_ip');

      if (storedIp && ips.includes(storedIp)) {
        return storedIp;
      }
      return ips[0] || null;
    },

    set(key, value) {
      const ips = this.get('local_ips');

      if (value && ips.includes(value)) {
        localStorage.setItem('local_ip', value);
      }

      return value;
    },
  }),

  label: computed('email', 'local_ip', function() {
    const email = this.get('email');
    const localIp = this.get('local_ip');
    let label;

    if (email && localIp) {
      label = `${email} (${localIp})`;
    } else if (localIp) {
      label = localIp;
    } else if (email) {
      label = email;
    } else {
      label = null;
    }

    return label;
  }),

  labelWithPublicIp: computed('email', 'public_ip', 'local_ip', function() {
    const email = this.get('email');
    const publicIp = this.get('public_ip');
    const localIp = this.get('local_ip');
    let label;

    if (email && localIp) {
      label = `${email} (${publicIp}/${localIp})`;
    } else if (localIp) {
      label = `${publicIp}/${localIp}`;
    } else if (email) {
      label = `${email} (${publicIp})`;
    } else {
      label = null;
    }

    return label;
  }),

  serialize() {
    const data = {
      uuid: this.get('uuid'),
      email: this.get('email'),
      public_ip: this.get('public_ip'),
      peer: {
        id: this.get('peer.id'),
      },
    };
    const localIp = this.get('local_ip');

    if (localIp) {
      data.local_ip = localIp;
    }

    return data;
  },

  // Make user"s email available after page reload,
  // by storing it in local storage.
  userEmailDidChange: observer('email', function() {
    const email = this.get('email');

    if (email) {
      localStorage.email = email;
    } else {
      localStorage.removeItem('email');
    }
  }),
});
