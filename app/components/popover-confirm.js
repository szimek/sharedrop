import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['popover-confirm'],
    isVisible: false,

    iconClass: function () {
        const filename = this.get('filename');
        let regex, match, extension;

        if (filename) {
            regex = /\.([0-9a-z]+)$/i;
            match = filename.match(/\.([0-9a-z]+)$/i);
            extension = match && match[1];

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
