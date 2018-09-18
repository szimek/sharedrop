import Route from '@ember/routing/route';

export default Route.extend({
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
