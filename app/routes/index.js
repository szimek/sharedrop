import Ember from 'ember';
import Room from '../services/room';

export default Ember.Route.extend({
    beforeModel: function() {
        var error = window.ShareDrop.error;

        if (error) {
            throw new Error(error);
        }
    },

    model: function () {
        // Get room name from the server
        return Ember.$.getJSON('/room').then(function (data) {
            return data.name;
        });
    },

    setupController: function (ctrl, model) {
        ctrl.set('model', []);
        ctrl.set('hasCustomRoomName', false);

        // Handle room events
        Ember.$.subscribe('connected.room', ctrl._onRoomConnected.bind(ctrl));
        Ember.$.subscribe('disconnected.room', ctrl._onRoomDisconnected.bind(ctrl));
        Ember.$.subscribe('user_added.room', ctrl._onRoomUserAdded.bind(ctrl));
        Ember.$.subscribe('user_changed.room', ctrl._onRoomUserChanged.bind(ctrl));
        Ember.$.subscribe('user_removed.room', ctrl._onRoomUserRemoved.bind(ctrl));

        // Handle peer events
        Ember.$.subscribe('incoming_peer_connection.p2p', ctrl._onPeerP2PIncomingConnection.bind(ctrl));
        Ember.$.subscribe('incoming_dc_connection.p2p', ctrl._onPeerDCIncomingConnection.bind(ctrl));
        Ember.$.subscribe('incoming_dc_connection_error.p2p', ctrl._onPeerDCIncomingConnectionError.bind(ctrl));
        Ember.$.subscribe('outgoing_peer_connection.p2p', ctrl._onPeerP2POutgoingConnection.bind(ctrl));
        Ember.$.subscribe('outgoing_dc_connection.p2p', ctrl._onPeerDCOutgoingConnection.bind(ctrl));
        Ember.$.subscribe('outgoing_dc_connection_error.p2p', ctrl._onPeerDCOutgoingConnectionError.bind(ctrl));
        Ember.$.subscribe('disconnected.p2p', ctrl._onPeerP2PDisconnected.bind(ctrl));
        Ember.$.subscribe('info.p2p', ctrl._onPeerP2PFileInfo.bind(ctrl));
        Ember.$.subscribe('response.p2p', ctrl._onPeerP2PFileResponse.bind(ctrl));
        Ember.$.subscribe('file_canceled.p2p', ctrl._onPeerP2PFileCanceled.bind(ctrl));
        Ember.$.subscribe('file_received.p2p', ctrl._onPeerP2PFileReceived.bind(ctrl));
        Ember.$.subscribe('file_sent.p2p', ctrl._onPeerP2PFileSent.bind(ctrl));

        // Join the room
        var room = new Room(model, window.ShareDrop.ref);
        room.join(ctrl.get('you').serialize());
        ctrl.set('room', room);
    },

    renderTemplate: function () {
        this.render();

        this.render('about_you', {
            into: 'application',
            outlet: 'about_you'
        });

        var key = 'show-instructions-for-app';
        if (!localStorage.getItem(key)) {
            this.send('openModal', 'about_app');
            localStorage.setItem(key, 'yup');
        }
    },

    actions: {
        willTransition: function () {
            Ember.$.unsubscribe('.room');
            Ember.$.unsubscribe('.p2p');

            this.controllerFor('index').get('room').leave();

            return true;
        }
    }
});
