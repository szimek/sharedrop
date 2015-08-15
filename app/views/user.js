import Ember from 'ember';

export default Ember.View.extend({
    classNames: ['peer'],
    classNameBindings: ['peer.peer.state'],

    localIps: function () {
        // Sort ips array
        return this.get('controller.model.local_ips').sort();
    }.property('controller.model.local_ips.[]'),

    hasManyLocalIps: function () {
        return this.get('localIps.length') > 1;
    }.property('localIps.length')
});
