import Component from '@ember/component';

export default Component.extend({
  content: null,
  selectedValue: null,

  didInitAttrs(...args) {
    this._super(args);
    const content = this.get('content');

    if (!content) {
      this.set('content', []);
    }
  },

  actions: {
    change() {
      const changeAction = this.get('action');
      const selectedEl = this.$('select')[0];
      const { selectedIndex } = selectedEl;
      const content = this.get('content');
      const selectedValue = content[selectedIndex];

      this.set('selectedValue', selectedValue);
      changeAction(selectedValue);
    },
  },
});
