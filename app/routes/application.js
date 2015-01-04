import Ember from 'ember';

export default Ember.Route.extend({
    actions: {
        openModal: function (modalName) {
            return this.render(modalName, {
                outlet: 'modal',
                into: 'application'
            });
        },

        closeModal: function () {
            return this.disconnectOutlet({
                outlet: 'modal',
                parentView: 'application'
            });
        }
    }
});
