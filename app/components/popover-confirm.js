import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['popover-confirm'],
  isVisible: false,
  iconClass: computed('filename', function() {
    const filename = this.get('filename');

    if (filename) {
      const regex = /\.([0-9a-z]+)$/i;
      const match = filename.match(regex);
      const extension = match && match[1];

      if (extension) {
        return `glyphicon-${extension.toLowerCase()}`;
      }
    }

    return undefined;
  }),

  actions: {
    confirm() {
      this.onConfirm();
    },

    cancel() {
      this.onCancel();
    },
  },
});
