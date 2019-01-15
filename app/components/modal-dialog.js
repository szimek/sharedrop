import Component from '@ember/component';

export default Component.extend({
    actions: {
        close: function () {
            // This sends an action to application route.
            // eslint-disable-next-line ember/closure-actions
            return this.onClose();
        }
    }
});
