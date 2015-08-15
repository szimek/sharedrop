import Ember from 'ember';

var alias = Ember.computed.alias;

export default  Ember.Controller.extend({
    index: Ember.inject.controller('index'),
    hasCustomRoomName: alias('index.hasCustomRoomName')
});
