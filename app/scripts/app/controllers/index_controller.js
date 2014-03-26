ShareDrop.App.IndexController = Ember.ArrayController.extend({
    needs: ['application'],

    you: Ember.computed.alias('controllers.application.you'),
    room: null,

    init: function () {
        // Handle room events
        $.subscribe('connected.room', this._onRoomConnected.bind(this));
        $.subscribe('disconnected.room', this._onRoomDisconnected.bind(this));
        $.subscribe('user_added.room', this._onRoomUserAdded.bind(this));
        $.subscribe('user_changed.room', this._onRoomUserChanged.bind(this));
        $.subscribe('user_removed.room', this._onRoomUserRemoved.bind(this));

        // Handle peer events
        $.subscribe('incoming_connection.p2p.peer', this._onPeerP2PIncomingConnection.bind(this));
        $.subscribe('outgoing_connection.p2p.peer', this._onPeerP2POutgoingConnection.bind(this));
        $.subscribe('disconnected.p2p.peer', this._onPeerP2PDisconnected.bind(this));
        $.subscribe('info.p2p.peer', this._onPeerP2PFileInfo.bind(this));
        $.subscribe('response.p2p.peer', this._onPeerP2PFileResponse.bind(this));
        $.subscribe('file_canceled.p2p.peer', this._onPeerP2PFileCanceled.bind(this));
        $.subscribe('file_received.p2p.peer', this._onPeerP2PFileReceived.bind(this));
        $.subscribe('file_sent.p2p.peer', this._onPeerP2PFileSent.bind(this));

        // Join the room
        var room = new ShareDrop.Room(ShareDrop.App.ref);
        room.join(this.get('you').serialize());
        this.set('room', room);

        this._super();
    },

    _onRoomConnected: function (event, data) {
        var you = this.get('you'),
            room = this.get('room');

        you.get('peer').setProperties(data.peer);
        delete data.peer;
        you.setProperties(data);

        // Find and set your local IP
        this._setUserLocalIP();

        // Initialize WebRTC
        this.set('webrtc', new ShareDrop.WebRTC(you.get('uuid'), {
            room: room.name,
            firebaseRef: ShareDrop.App.ref
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
        peer = ShareDrop.App.Peer.create(attrs);
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
            peer.setProperties($.extend({}, defaults, data));
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

        peer.set('peer.connection', connection);
    },

    _onPeerP2POutgoingConnection: function (event, data) {
        var webrtc = this.get('webrtc'),
            connection = data.connection,
            peer = this.findBy('peer.id', connection.peer),
            file = peer.get('transfer.file'),
            info = webrtc.getFileInfo(file);

        peer.set('peer.connection', connection);
        peer.set('internalState', 'awaiting_response');

        webrtc.sendFileInfo(connection, info);
        console.log('Sending a file info...', info);
    },

    _onPeerP2PDisconnected: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        if (peer) {
            peer.set('peer.connection', null);
        }
    },

    _onPeerP2PFileInfo: function (event, data) {
        console.log('Peer:\t Received file info', data);

        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer),
            info = data.info;

        peer.set('transfer.info', info);
        peer.set('internalState', 'received_file_info');
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
            peer.set('internalState', 'receiving_file_data');
        } else {
            peer.set('internalState', 'declined_file_transfer');
        }
    },

    _onPeerP2PFileCanceled: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        connection.close();
        peer.set('transfer.receiving_progress', 0);
        peer.set('transfer.info', null);
        peer.set('internalState', 'idle');
    },

    _onPeerP2PFileReceived: function (event, data) {
        console.log('Peer:\t Received file', data);

        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        connection.close();
        peer.set('transfer.receivingProgress', 0);
        peer.set('transfer.info', null);
        peer.set('internalState', 'idle');
    },

    _onPeerP2PFileSent: function (event, data) {
        console.log('Peer:\t Sent file', data);

        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        peer.set('transfer.sendingProgress', 0);
        peer.set('transfer.file', null);
        peer.set('internalState', 'idle');
    },

    // Based on http://net.ipcalf.com/
    // SDP offer is used on Firefox, ICE candidate on Chrome
    _setUserLocalIP: function () {
        var you = this.get('you');

        // RTCPeerConnection is provided by PeerJS library
        var rtc = new window.RTCPeerConnection({iceServers: []});

        // Firefox needs a channel/stream to proceed
        if (window.mozRTCPeerConnection) {
            rtc.createDataChannel('', {reliable: false});
        }

        rtc.onicecandidate = function (event) {
            if (event.candidate) {
                var addr = grep(event.candidate.candidate);
                if (addr) {
                    console.log('Local IP found: ', addr);
                    you.set('local_ip', addr);
                }
            }
        };

        rtc.createOffer(
            function (offer) {
                rtc.setLocalDescription(offer);

                var addr = grep(offer.sdp);
                if (addr && addr !== '0.0.0.0') {
                    console.log('Local IP found: ', addr);
                    you.set('local_ip', addr);
                }

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

                if (~line.indexOf("a=candidate")) {
                    parts = line.split(' ');
                    addr = parts[4];
                    type = parts[7];

                    if (type === 'host') {
                        return addr;
                    }
                } else if (~line.indexOf("c=")) {
                    parts = line.split(' ');
                    addr = parts[2];

                    return addr;
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
