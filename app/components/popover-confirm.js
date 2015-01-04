import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['popover-confirm'],

    iconClass: function () {
        var filename = this.get('filename'),
            regex, extension;

        if (filename) {
            regex = /\.([0-9a-z]+)$/i;
            extension = filename.match(/\.([0-9a-z]+)$/i)[1];
            if (extension) { return 'glyphicon-' + extension.toLowerCase(); }
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
            var html = this.$().html();

            // Content needs to be visible,
            // so that popover position is calculated properly.
            this.$().show();
            this.$().popover({
                html: true,
                content: html,
                placement: 'top'
            });
            this.$().popover('show');
            this.$().hide();
        });
    },

    hide: function () {
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
