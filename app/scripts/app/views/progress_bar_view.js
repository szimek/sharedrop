FileDrop.ProgressBarView = Ember.View.extend({
    tagName: 'svg',
    templateName: 'progress-bar',

    attributeBindings: ['width', 'height', 'viewport'],
    width: "84",
    height: "84",
    viewport: "0 0 84 84",

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
            x = Math.sin( r ) * 42,
            y = Math.cos( r ) * - 42,
            anim = 'M 0 0 v -42 A 42 42 1 '
                 + mid + ' 1 '
                 +  x  + ' '
                 +  y  + ' z';

        this.get('path').attr('d', anim);
    }
});
