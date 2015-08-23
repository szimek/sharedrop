import Ember from 'ember';

export default Ember.TextField.extend({
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
    },

    // Hackish way to reset file input when sender cancels file transfer,
    // so if sender wants later to send the same file again,
    // the 'change' event is triggered correctly.
    fileDidChange: function () {
        if (!this.get('file')) {
            var field = this.$();
            field.wrap('<form>').closest('form').get(0).reset();
            field.unwrap();
        }
    }.observes('file')
});
