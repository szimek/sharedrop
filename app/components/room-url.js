import TextField from '@ember/component/text-field';
import $ from 'jquery';

export default TextField.extend({
  classNames: ['room-url'],

  didInsertElement() {
    $(this.element).focus().select();
  },

  copyValueToClipboard() {
    if (window.ClipboardEvent) {
      const pasteEvent = new window.ClipboardEvent('paste', {
        dataType: 'text/plain',
        data: this.element.value,
      });
      document.dispatchEvent(pasteEvent);
    }
  },
});
