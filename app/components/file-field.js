import TextField from '@ember/component/text-field';

export default TextField.extend({
  type: 'file',
  classNames: ['invisible'],

  click(event) {
    event.stopPropagation();
  },

  change(event) {
    const input = event.target;
    const { files } = input;
    const file = files[0];

    this.onChange({ file });
    this.reset();
  },

  // Hackish way to reset file input when sender cancels file transfer,
  // so if sender wants later to send the same file again,
  // the 'change' event is triggered correctly.
  reset() {
    const field = this.$();
    field
      .wrap('<form>')
      .closest('form')
      .get(0)
      .reset();
    field.unwrap();
  },
});
