import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['popover-confirm'],
    isVisible: false,

    iconClass: function () {
        const filename = this.get('filename');

        if (filename) {
            const regex = /\.([0-9a-z]+)$/i;
            const match = filename.match(regex);
            const extension = match && match[1];

            if (extension) {
                return 'glyphicon-' + extension.toLowerCase();
            }
        }
    }.property('filename'),

    actions: {
        confirm: function () {
            this.sendAction('confirm');
        },

        cancel: function() {
            this.sendAction('cancel');
        }
    }
});
