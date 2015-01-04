import Ember from 'ember';

export default Ember.View.extend({
    classNames: ['peer'],
    classNameBindings: ['peer.peer.state'],

    localIps: function () {
        // Convert unordered set to sorted array
        var ips = this.get('controller.model.local_ips');
        return ips.toArray().sort();
    }.property('controller.model.local_ips.[]'),

    hasManyLocalIps: function () {
        return this.get('localIps.length') > 1;
    }.property('localIps.length')
});
