import Ember from 'ember';

var equal = Ember.computed.equal;

export default Ember.View.extend({
    peer: Ember.computed.alias('controller.model'),
    classNames: ['peer'],
    classNameBindings: ['peer.peer.state'],

    isIdle: equal('peer.state', 'idle'),
    isAwaitingFileInfo: equal('peer.state', 'awaiting_file_info'),
    isAwaitingResponse: equal('peer.state', 'awaiting_response'),
    hasReceivedFileInfo: equal('peer.state', 'received_file_info'),
    hasDeclinedFileTransfer: equal('peer.state', 'declined_file_transfer'),
    hasError: equal('peer.state', 'error'),

    errorTemplateName: function () {
        var errorCode = this.get('peer.errorCode');
        return errorCode ? 'errors/popovers/' + errorCode : null;
    }.property('peer.errorCode'),

    label: function () {
        if (this.get('controller.hasCustomRoomName')) {
            return this.get('peer.labelWithPublicIp');
        } else {
            return this.get('peer.label');
        }
    }.property('controller.hasCustomRoomName', 'peer.label', 'peer.labelWithPublicIp')
});
