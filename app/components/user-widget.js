import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['peer'],
  classNameBindings: ['peer.peer.state'],

  localIps: computed('user.local_ips.[]', function() {
    // Sort ips array
    return this.get('user.local_ips').sort();
  }),

  hasManyLocalIps: computed('localIps.length', function() {
    return this.get('localIps.length') > 1;
  }),
});
