// TODO: provide TURN server config

FileDrop.WebRTC = function (options) {
    this.conn = new Peer({ // PeerJS client library
        host: 'file-drop-peer-server.herokuapp.com',
        port: 80,
        config: {'iceServers': [
            { url: 'stun:stun.l.google.com:19302' }
        ]},
        debug: 3
    });

    // When connected to PeerJS server
    this.conn.on('open', function (id) {
        var self = this;

        $.publish('connected.server.peer', {id: id});
        console.log('Peer:\t Connected to server with ID: ', id);

        // TODO: cancel on error/disconnect
        // Ping WebSocket server to prevent timeout on Heroku
        window.setInterval(function () {
            self.socket.send({type: 'ping'});
        }, 5000);
    });

    // Listen for incoming connections
    this.conn.on('connection', this._onConnection);

    this.conn.on('close', function (error) {
        console.log('Peer:\t Connected to server closed.');
    });


    this.conn.on('error', function (error) {
        console.log('Peer:\t Error while connecting to server: ', error);
    });

    // Make sure PeerJS connection is cleaned up
    window.onunload = window.onbeforeunload = function () {
        if (!!this.conn && !this.conn.destroyed) {
            this.conn.destroy();
        }
    };
};

FileDrop.WebRTC.prototype.connect = function (id) {
    var connection = this.conn.connect(id, {
        label: 'file',
        reliable: true
    });

    connection.on('open', function () {
        this._onConnection(connection);
    }.bind(this));

    connection.on('error', function (error) {
        console.log('Peer:\t P2P connection error', error);
    }.bind(this));
};

FileDrop.WebRTC.prototype._onConnection = function (connection) {
    $.publish('connected.p2p.peer', {connection: connection});
    console.log('Peer:\t P2P connection opened: ', connection);

    connection.on('data', function (data) {
        switch (data.type) {
        case 'info':
            $.publish('info.p2p.peer', {
                connection: connection,
                info: data.payload
            });
            console.log('Peer:\t File info: ', data);
            break;

        case 'response':
            $.publish('response.p2p.peer', {
                connection: connection,
                response: data.payload
            });
            console.log('Peer:\t File response: ', data);
            break;

        case 'file':
            $.publish('file.p2p.peer', {
                connection: connection,
                file: data.payload
            });
            console.log('Peer:\t File: ', data);
            break;
        }
    });

    connection.on('close', function () {
        $.publish('disconnected.p2p.peer', {connection: connection});
        console.log('Peer:\t P2P connection opened: ', connection);
    });
};

FileDrop.WebRTC.prototype.sendFileInfo = function (connection, file) {
    var info = {
        lastModifiedDate: file.lastModifiedDate,
        name: file.name,
        size: file.size,
        type: file.type
    };

    connection.send({
        type: 'info',
        payload: info
    });
};

FileDrop.WebRTC.prototype.sendFileResponse = function (connection, response) {
    connection.send({
        type: 'response',
        payload: response
    });
};

FileDrop.WebRTC.prototype.sendFile = function (connection, file) {
    connection.send({
        type: 'file',
        payload: {
            lastModifiedDate: file.lastModifiedDate,
            name: file.name,
            size: file.size,
            type: file.type,
            data: file
        }
    });
};
