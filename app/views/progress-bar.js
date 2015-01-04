import Ember from 'ember';

export default Ember.View.extend({
    tagName: 'svg',
    templateName: 'progress_bar',

    attributeBindings: ['width', 'height', 'viewport'],
    width: "76",
    height: "76",
    viewport: "0 0 76 76",

    didInsertElement: function () {
        this.set('path', this.$().find('path'));
    },

    sendingProgressDidChange: function () {
        var progress = this.get('controller.model.transfer.sendingProgress');

        this._calculateSVGAnim(progress);
    }.observes('controller.model.transfer.sendingProgress'),

    receivingProgressDidChange: function () {
        var progress = this.get('controller.model.transfer.receivingProgress');

        this._calculateSVGAnim(progress);
    }.observes('controller.model.transfer.receivingProgress'),

    _calculateSVGAnim: function (progress) {
        var π = Math.PI,
            α = progress * 360,
            r = ( α * π / 180 ),
            mid = ( α > 180 ) ? 1 : 0,
            x = Math.sin( r ) * 38,
            y = Math.cos( r ) * - 38,
            anim = 'M 0 0 v -38 A 38 38 1 '
                 + mid + ' 1 '
                 +  x  + ' '
                 +  y  + ' z';

        this.get('path').attr('d', anim);
    }
});
