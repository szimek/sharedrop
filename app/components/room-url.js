import Ember from 'ember';

export default Ember.TextField.extend({
    classNames: ['room-url'],

    becomeSelected: function () {
        this.$().focus().select();
    }.on('didInsertElement'),

    copyValueToClipboard: function () {
        if (window.ClipboardEvent) {
            var pasteEvent = new window.ClipboardEvent('paste', {
                dataType: 'text/plain',
                data: this.$().val()
            });
            document.dispatchEvent(pasteEvent);
        }
    }
});
