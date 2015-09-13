import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['popover-confirm'],

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

    isShowingDidChange: function () {
        if (!!this.get('isShowing')) {
           this.show();
        } else {
           this.hide();
        }
    }.observes('isShowing'),

    didInsertElement: function () {
        this._super();

        this.$().hide();
    },

    // Uber hacky way to make Bootstrap 'popover' plugin work with Ember metamorph
    show: function () {
        // Delay until related properties are computed
        Ember.run.next(this, function () {
            const element = this.$();
            if (!element) { return; }

            var html = element.html();

            // Content needs to be visible,
            // so that popover position is calculated properly.
            element.show();
            element.popover({
                html: true,
                content: html,
                placement: 'top'
            });
            element.popover('show');
            element.hide();
        });
    },

    hide: function () {
        const element = this.$();
        if (!element) { return; }

        this.$().popover('destroy');
    },

    actions: {
        confirm: function () {
            this.hide();
            this.sendAction('confirm');
        },

        cancel: function() {
            this.hide();
            this.sendAction('cancel');
        }
    }
});
