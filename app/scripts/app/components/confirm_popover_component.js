FileDrop.ConfirmPopoverComponent = Ember.Component.extend({
    classNames: ['popover-confirm'],

    isShowingDidChange: function () {
        !!this.get('isShowing') ? this.show() : this.hide();
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
