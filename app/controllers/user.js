import Ember from 'ember';

var alias = Ember.computed.alias;

export default  Ember.ObjectController.extend({
    needs: 'index',
    hasCustomRoomName: alias('controllers.index.hasCustomRoomName')
});
