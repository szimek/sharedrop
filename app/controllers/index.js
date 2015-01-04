import Ember from 'ember';
import WebRTC from '../services/web-rtc';
import Peer from '../models/peer';

export default Ember.ArrayController.extend({
    needs: ['application'],

    you: Ember.computed.alias('controllers.application.you'),
    room: null,
    webrtc: null,

    _onRoomConnected: function (event, data) {
        var you = this.get('you'),
            room = this.get('room');

        you.get('peer').setProperties(data.peer);
        delete data.peer;
        you.setProperties(data);

        // Find and set your local IP
        this._setUserLocalIP();

        // Initialize WebRTC
        this.set('webrtc', new WebRTC(you.get('uuid'), {
            room: room.name,
            firebaseRef: window.ShareDrop.ref
        }));
    },

    _onRoomDisconnected: function () {
        this.clear();
        this.set('webrtc', null);
    },

    _onRoomUserAdded: function (event, data) {
        var you = this.get('you');

        if (you.get('uuid') !== data.uuid) {
            this._addPeer(data);
        }
    },

    _addPeer: function (attrs) {
        var peerAttrs = attrs.peer,
            peer;

        delete attrs.peer;
        peer = Peer.create(attrs);
        peer.get('peer').setProperties(peerAttrs);

        this.pushObject(peer);
    },

    _onRoomUserChanged: function (event, data) {
        var peer = this.findBy('uuid', data.uuid),
            peerAttrs = data.peer,
            defaults = {
                uuid: null,
                email: null,
                public_ip: null,
                local_ip: null
            };

        if (peer) {
            delete data.peer;
            // Firebase doesn't return keys with null values,
            // so we have to add them back.
            peer.setProperties(Ember.$.extend({}, defaults, data));
            peer.get('peer').setProperties(peerAttrs);
        }
    },

    _onRoomUserRemoved: function (event, data) {
        var peer = this.findBy('uuid', data.uuid);
        this.removeObject(peer);
    },

    _onPeerP2PIncomingConnection: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        // Don't switch to 'connecting' state on incoming connection,
        // as p2p connection may still fail.
        peer.set('peer.connection', connection);
    },

    _onPeerDCIncomingConnection: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        peer.set('peer.state', 'connected');
    },

    _onPeerDCIncomingConnectionError: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer),
            error = data.error;

            switch (error.type) {
                case 'failed':
                peer.set('peer.connection', null);
                break;
            }
    },

    _onPeerP2POutgoingConnection: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        peer.setProperties({
            'peer.connection': connection,
            'peer.state': 'connecting'
        });
    },

    _onPeerDCOutgoingConnection: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer),
            file = peer.get('transfer.file'),
            webrtc = this.get('webrtc'),
            info = webrtc.getFileInfo(file);

        peer.set('peer.state', 'connected');
        peer.set('state', 'awaiting_response');

        webrtc.sendFileInfo(connection, info);
        console.log('Sending a file info...', info);
    },

    _onPeerDCOutgoingConnectionError: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer),
            error = data.error;

        switch (error.type) {
            case 'failed':
            peer.setProperties({
                'peer.connection': null,
                'peer.state': 'disconnected',
                'state': 'error',
                'errorCode': data.error.type
            });
            break;
        }
    },

    _onPeerP2PDisconnected: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        if (peer) {
            peer.set('peer.connection', null);
            peer.set('peer.state', 'disconnected');
        }
    },

    _onPeerP2PFileInfo: function (event, data) {
        console.log('Peer:\t Received file info', data);

        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer),
            info = data.info;

        peer.set('transfer.info', info);
        peer.set('state', 'received_file_info');
    },

    _onPeerP2PFileResponse: function (event, data) {
        console.log('Peer:\t Received file response', data);

        var webrtc = this.get('webrtc'),
            connection = data.connection,
            peer = this.findBy('peer.id', connection.peer),
            response = data.response,
            file;

        if (response) {
            file = peer.get('transfer.file');

            connection.on('sending_progress', function (progress) {
                peer.set('transfer.sendingProgress', progress);
            });
            webrtc.sendFile(connection, file);
            peer.set('state', 'receiving_file_data');
        } else {
            peer.set('state', 'declined_file_transfer');
        }
    },

    _onPeerP2PFileCanceled: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        connection.close();
        peer.set('transfer.receivingProgress', 0);
        peer.set('transfer.info', null);
        peer.set('state', 'idle');
    },

    _onPeerP2PFileReceived: function (event, data) {
        console.log('Peer:\t Received file', data);

        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        connection.close();
        peer.set('transfer.receivingProgress', 0);
        peer.set('transfer.info', null);
        peer.set('state', 'idle');
        peer.trigger('didReceiveFile');
    },

    _onPeerP2PFileSent: function (event, data) {
        console.log('Peer:\t Sent file', data);

        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        peer.set('transfer.sendingProgress', 0);
        peer.set('transfer.file', null);
        peer.set('state', 'idle');
        peer.trigger('didSendFile');
    },

    // Based on http://net.ipcalf.com/
    _setUserLocalIP: function () {
        var ips = this.get('you.local_ips');

        // RTCPeerConnection is provided by PeerJS library
        var rtc = new window.RTCPeerConnection({iceServers: []});
        rtc.createDataChannel('', {reliable: false});

        rtc.onicecandidate = function (event) {
            if (event.candidate) {
                grep(event.candidate.candidate);
            }
        };

        rtc.createOffer(
            function (offer) {
                grep(offer.sdp);
                rtc.setLocalDescription(offer);
            },
            function (error) {
                console.warn("Fetching local IP failed", error);
            }
        );

        function grep(sdpOrCandidate) {
            var lines = sdpOrCandidate.split('\r\n'),
                i, parts, addr, type;

            for (i = 0; i < lines.length; i++) {
                var line = lines[i];

                if (~line.indexOf("a=candidate") || line.match(/^candidate:\d+\s/)) {
                    parts = line.split(' ');
                    addr = parts[4];
                    type = parts[7];

                    if (type === 'host') {
                        if (addr !== '0.0.0.0') {
                            ips.addObject(addr);
                        }
                    }
                } else if (~line.indexOf("c=")) {
                    parts = line.split(' ');
                    addr = parts[2];

                    if (addr !== '0.0.0.0') {
                        ips.addObject(addr);
                    }
                }
            }
        }
    },

    // Broadcast some of user's property changes to other peers
    userEmailDidChange: function () {
        var email = this.get('you.email'),
            room  = this.get('room');

        if (room) {
            console.log('Broadcasting user\'s email: ', email);
            room.update({email: email});
        }
    }.observes('you.email'),

    userLocalIPDidChange: function () {
        var addr = this.get('you.local_ip'),
            room  = this.get('room');

        if (room && addr) {
            console.log('Broadcasting user\'s local IP: ', addr);
            room.update({local_ip: addr});
        }
    }.observes('you.local_ip')
});
