import Component from '@ember/component';

export default Component.extend({
    actions: {
        close: function () {
            return this.get('closeModal')();
        }
    }
});
