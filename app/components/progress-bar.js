import Component from '@ember/component';
import { observer } from '@ember/object';

export default Component.extend({
  tagName: 'svg',

  attributeBindings: ['width', 'height', 'viewport'],
  width: '76',
  height: '76',
  viewport: '0 0 76 76',

  transfer: null,

  didInsertElement() {
    this.set('path', this.$().find('path'));
  },

  sendingProgressDidChange: observer('transfer.sendingProgress', function() {
    const progress = this.get('transfer.sendingProgress');

    if (this.get('path')) {
      this._calculateSVGAnim(progress);
    }
  }),

  receivingProgressDidChange: observer(
    'transfer.receivingProgress',
    function() {
      const progress = this.get('transfer.receivingProgress');

      if (this.get('path')) {
        this._calculateSVGAnim(progress);
      }
    }
  ),

  _calculateSVGAnim(progress) {
    const path = this.get('path');
    if (!path) {
      return;
    }

    const π = Math.PI;
    const α = progress * 360;
    const r = (α * π) / 180;
    const mid = α > 180 ? 1 : 0;
    const x = Math.sin(r) * 38;
    const y = Math.cos(r) * -38;
    const anim = `M 0 0 v -38 A 38 38 1 ${mid} 1 ${x} ${y} z`;

    path.attr('d', anim);
  },
});
