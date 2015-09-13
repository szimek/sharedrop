import Ember from "ember";

export default Ember.Component.extend({
  content: null,
  selectedValue: null,

  didInitAttrs: function () {
    this._super(...arguments);
    const content = this.get("content");

    if (!content) {
      this.set("content", []);
    }
  },

  actions: {
    change: function () {
      const changeAction = this.get("action");
      const selectedEl = this.$("select")[0];
      const selectedIndex = selectedEl.selectedIndex;
      const content = this.get("content");
      const selectedValue = content[selectedIndex];

      this.set("selectedValue", selectedValue);
      changeAction(selectedValue);
    }
  }
});
