import TextField from '@ember/component/text-field';

export default TextField.extend({
    classNames: ['room-url'],

    didInsertElement: function () {
        this.$().focus().select();
    },

    copyValueToClipboard: function () {
        if (window.ClipboardEvent) {
            const pasteEvent = new window.ClipboardEvent('paste', {
                dataType: 'text/plain',
                data: this.$().val()
            });
            document.dispatchEvent(pasteEvent);
        }
    }
});
