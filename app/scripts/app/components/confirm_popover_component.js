FileDrop.ConfirmPopoverComponent = Ember.Component.extend({
    label: function () {
        var email = this.get('peer.email'),
            addr = this.get('peer.local_ip');

        return email || addr;
    }.property('peer.email', 'peer.local_ip'),

    filename: function () {
        var file = this.get('peer.transfer.file');
        return file ? file.name : null;
    }.property('peer.transfer.file'),

    openedDidChange: function () {
        !!this.get('opened') ? this.show() : this.hide();
    }.observes('opened'),

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
            this.hide();
            this.sendAction('confirm');
        },

        cancel: function() {
            this.hide();
            this.sendAction('cancel');
        }
    }
});
