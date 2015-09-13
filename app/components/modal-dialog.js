import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        close: function () {
            return this.sendAction();
        },

        nop: function () {}
    }
});
