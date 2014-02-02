FileDrop.FileField = Ember.TextField.extend({
    type: 'file',
    classNames: ['invisible'],

    click: function (event) {
        event.stopPropagation();
    },

    change: function (event) {
        var input = event.target,
            files = input.files,
            file = files[0];

        this.sendAction('action', { file: file });
    }
});
