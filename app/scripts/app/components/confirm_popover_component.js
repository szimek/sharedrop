FileDrop.ConfirmPopoverComponent = Ember.Component.extend({
    didInsertElement: function () {
        this._super();

        var html = this.$().html();

        this.$().popover({
            html: true,
            content: html,
            placement: 'top'
        });

        this.$().html("");
    },

    show: function () {
        this.$().popover('show');
    },

    hide: function () {
        this.$().popover('hide');
    },

    actions: {
        confirm: function () {
            console.log('confirm');
            this.set('isVisible', false);
            // this.sendAction();
        },

        cancel: function() {
            console.log('cancel');
            this.set('isVisible', false);
            // this.sendAction();
        }
    }
});
