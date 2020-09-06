import TextField from '@ember/component/text-field';
import $ from 'jquery';

export default TextField.extend({
  type: 'file',
  classNames: ['invisible'],

  click(event) {
    event.stopPropagation();
  },

  change(event) {
    const input = event.target;
    const { files } = input;
    this.onChange({ files });
    this.reset();
  },

  // Hackish way to reset file input when sender cancels file transfer,
  // so if sender wants later to send the same file again,
  // the 'change' event is triggered correctly.
  reset() {
    const field = $(this.element);
    field.wrap('<form>').closest('form').get(0).reset();
    field.unwrap();
  },
});
