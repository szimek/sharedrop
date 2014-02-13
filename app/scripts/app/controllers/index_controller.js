FileDrop.IndexController = Ember.ArrayController.extend({
    needs: ['application'],

    you: Ember.computed.alias('controllers.application.you'),
    room: null,

    init: function () {
        // Connect to PeerJS server first,
        // so that we already have peer ID when later joining a room.
        this.set('_peer', new FileDrop.WebRTC());

        // Handle room events
        $.subscribe('connected.room', this._onRoomConnected.bind(this));
        $.subscribe('user_list.room', this._onRoomUserList.bind(this));
        $.subscribe('user_added.room', this._onRoomUserAdded.bind(this));
        $.subscribe('user_changed.room', this._onRoomUserChanged.bind(this));
        $.subscribe('user_removed.room', this._onRoomUserRemoved.bind(this));

        // Handle peer events
        $.subscribe('connected.server.peer', this._onPeerServerConnected.bind(this));
        $.subscribe('connected.p2p.peer', this._onPeerP2PConnected.bind(this));
        $.subscribe('disconnected.p2p.peer', this._onPeerP2PDisconnected.bind(this));
        $.subscribe('info.p2p.peer', this._onPeerP2PFileInfo.bind(this));
        $.subscribe('response.p2p.peer', this._onPeerP2PFileResponse.bind(this));
        $.subscribe('file.p2p.peer', this._onPeerP2PFileTransfer.bind(this));

        this._super();
    },

    _onRoomConnected: function (event, data) {
        var you = this.get('you');

        you.get('peer').setProperties(data.peer);
        delete data.peer;
        you.setProperties(data);

        // Find and set your local IP
        this._setUserLocalIP();
    },

    _onRoomUserList: function (event, data) {
        // Add all peers to the list and
        // initiate p2p connection to every one of them.
        var _peer = this.get('_peer');

        data.forEach(function (attrs) {
            var peerAttrs = attrs.peer,
                peer;

            delete attrs.peer;
            peer = FileDrop.Peer.create(attrs);
            peer.get('peer').setProperties(peerAttrs);

            this.pushObject(peer);
            _peer.connect(peer.get('peer.id'));
        }.bind(this));
    },

    _onRoomUserAdded: function (event, data) {
        var you = this.get('you'),
            peerAttrs = data.peer,
            peer;

        // Add peer to the list of peers in the room
        if (you.get('uuid') !== data.uuid) {
            delete data.peer;
            peer = FileDrop.Peer.create(data);
            peer.get('peer').setProperties(peerAttrs);

            this.pushObject(peer);
        }
    },

    _onRoomUserChanged: function (event, data) {
        var peer = this.findBy('uuid', data.uuid),
            peerAttrs = data.peer;

        if (peer) {
            delete data.peer;
            peer.setProperties(data);
            peer.get('peer').setProperties(peerAttrs);
        }
    },

    _onRoomUserRemoved: function (event, data) {
        var peer = this.findBy('uuid', data.uuid);
        this.removeObject(peer);
    },

    _onPeerServerConnected: function (event, data) {
        var you = this.get('you');

        you.set('isConnected', true);
        you.set('peer.id', data.id);

        // Join room and broadcast your attributes
        var room = new FileDrop.Room();
        room.join(you.serialize());
        you.set('room', room);
        this.set('room', room);
    },

    _onPeerP2PConnected: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        peer.set('peer.connection', connection);
    },

    _onPeerP2PDisconnected: function (event, data) {
        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer);

        if (peer) peer.set('peer.connection', null);
    },

    _onPeerP2PFileInfo: function (event, data) {
        console.log('Peer:\t Received file info', data);

        var connection = data.connection,
            peer = this.findBy('peer.id', connection.peer),
            info = data.info;

        peer.set('transfer.info', info);
    },

    _onPeerP2PFileResponse: function (event, data) {
        console.log('Peer:\t Received file response', data);

        var _peer = this.get('_peer'),
            connection = data.connection,
            peer = this.findBy('peer.id', connection.peer),
            response = data.response,
            file;

        if (response) {
            file = peer.get('transfer.file');

            peer.get('peer.connection').on('sending_progress', function (progress) {
                peer.set('transfer.sendingProgress', progress);
            });
            _peer.sendFile(connection, file);
        }

        // Remove "cached" file for that peer now that we have a response
        peer.set('transfer.file', null);
    },

    _onPeerP2PFileTransfer: function (event, data) {
        console.log('Peer:\t Received file', data);

        var file = data.file,
            dataView, dataBlob, dataUrl;

        if (file.data.constructor === ArrayBuffer) {
            dataView = new Uint8Array(file.data);
            dataBlob = new Blob([dataView]);
            dataUrl = window.URL.createObjectURL(dataBlob);

            // Save received file
            var a = document.createElement('a');
            a.setAttribute('download', file.name);
            a.setAttribute('href', dataUrl);
            document.body.appendChild(a);
            a.click();
        }
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
                if (addr) {
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

    // Broadcast user's selected changes to other peers
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

        if (room && addr !== undefined) {
            console.log('Broadcasting user\'s local IP: ', addr);
            room.update({local_ip: addr});
        }
    }.observes('you.local_ip')
});
