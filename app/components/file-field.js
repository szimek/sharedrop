import TextField from '@ember/component/text-field';

export default TextField.extend({
    type: 'file',
    classNames: ['invisible'],

    click: function (event) {
        event.stopPropagation();
    },

    change: function (event) {
        const input = event.target;
        const files = input.files;
        const file = files[0];

        this.onChange({file: file});
        this.reset();
    },

    // Hackish way to reset file input when sender cancels file transfer,
    // so if sender wants later to send the same file again,
    // the 'change' event is triggered correctly.
    reset: function () {
        const field = this.$();
        field.wrap('<form>').closest('form').get(0).reset();
        field.unwrap();
    }
});
