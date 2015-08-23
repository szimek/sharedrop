import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['peer'],
    classNameBindings: ['peer.peer.state'],

    localIps: function () {
        // Sort ips array
        return this.get('user.local_ips').sort();
    }.property('user.local_ips.[]'),

    hasManyLocalIps: function () {
        return this.get('localIps.length') > 1;
    }.property('localIps.length')
});
