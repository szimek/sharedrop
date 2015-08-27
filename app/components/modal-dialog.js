import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        close() {
            console.log("nop");
            return this.sendAction();
        },

        nop() {}
    }
});
