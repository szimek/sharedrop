// TODO:
// - provide TURN server config once it's possible to create rooms with custom names
// - use Ember.Object.extend()

import Ember from 'ember';
import File from './file';

var WebRTC = function (id, options) {
    var defaults = {
        config: {'iceServers': [
            { url: 'stun:stun.l.google.com:19302' }
        ]},
        debug: 3
    };

    this.conn = new window.Peer(id, Ember.$.extend(defaults, options));

    this.files = {
        outgoing: {},
        incoming: {}
    };

    // Listen for incoming connections
    this.conn.on('connection', function (connection) {
        Ember.$.publish('incoming_peer_connection.p2p', {connection: connection});

        connection.on('open', function () {
            console.log('Peer:\t Data channel connection opened: ', connection);
            Ember.$.publish('incoming_dc_connection.p2p', {connection: connection});
        });

        connection.on('error', function (error) {
            console.log('Peer:\t Data channel connection error', error);
            Ember.$.publish('incoming_dc_connection_error.p2p', {connection: connection, error: error});
        });

        this._onConnection(connection);
    }.bind(this));

    this.conn.on('close', function () {
        console.log('Peer:\t Connection to server closed.');
    });

    this.conn.on('error', function (error) {
        console.log('Peer:\t Error while connecting to server: ', error);
    });
};

WebRTC.CHUNK_MTU = 16000;
WebRTC.CHUNKS_PER_ACK = 64;

WebRTC.prototype.connect = function (id) {
    var connection = this.conn.connect(id, {
        label: 'file',
        reliable: true,
        serialization: 'none' // we handle serialization ourselves
    });

    connection.on('open', function () {
        console.log('Peer:\t Data channel connection opened: ', connection);
        Ember.$.publish('outgoing_dc_connection.p2p', {connection: connection});
    });

    connection.on('error', function (error) {
        console.log('Peer:\t Data channel connection error', error);
        Ember.$.publish('outgoing_dc_connection_error.p2p', {connection: connection, error: error});
    });

    Ember.$.publish('outgoing_peer_connection.p2p', {connection: connection});
    this._onConnection(connection);
};

WebRTC.prototype._onConnection = function (connection) {
    var self = this;

    console.log('Peer:\t Opening data channel connection...', connection);

    connection.on('data', function (data) {
        // Lame type check
        if (data.byteLength !== undefined) {
            // ArrayBuffer
            self._onBinaryData(data, connection);
        } else {
            // JSON string
            self._onJSONData(JSON.parse(data), connection);
        }
    });

    connection.on('close', function () {
        Ember.$.publish('disconnected.p2p', {connection: connection});
        console.log('Peer:\t P2P connection closed: ', connection);
    });
};

WebRTC.prototype._onBinaryData = function (data, connection) {
    var self = this,
        incoming = this.files.incoming[connection.peer],
        info = incoming.info,
        file = incoming.file,
        block = incoming.block,
        receivedChunkNum = incoming.receivedChunkNum,
        chunksPerAck = WebRTC.CHUNKS_PER_ACK,
        nextChunkNum, lastChunkInFile, lastChunkInBlock;

    connection.emit('receiving_progress', receivedChunkNum / (info.chunksTotal - 1));
    // console.log('Got chunk no ' + (receivedChunkNum + 1) + ' out of ' + info.chunksTotal);

    block.push(data);

    nextChunkNum = incoming.receivedChunkNum = receivedChunkNum + 1;
    lastChunkInFile = receivedChunkNum === info.chunksTotal - 1;
    lastChunkInBlock = receivedChunkNum > 0 && ((receivedChunkNum + 1) % chunksPerAck) === 0;

    if (lastChunkInFile || lastChunkInBlock) {
        file.append(block).then(function () {
            if (lastChunkInFile) {
                file.save();

                Ember.$.publish('file_received.p2p', {
                    blob: file,
                    info: info,
                    connection: connection
                });
            } else {
                // console.log('Requesting block starting at: ' + (nextChunkNum));
                incoming.block = [];
                self._requestFileBlock(connection, nextChunkNum);
            }
        });
    }
};

WebRTC.prototype._onJSONData = function (data, connection) {
    switch (data.type) {
    case 'info':
        var info = data.payload;

        Ember.$.publish('info.p2p', {
            connection: connection,
            info: info
        });

        // Store incoming file info for later
        this.files.incoming[connection.peer] = {
            info: info,
            file: null,
            block: [],
            receivedChunkNum: 0
        };

        console.log('Peer:\t File info: ', data);
        break;

    case 'cancel':
        Ember.$.publish('file_canceled.p2p', {
            connection: connection
        });

        console.log('Peer:\t Sender canceled file transfer');
        break;

    case 'response':
        var response = data.payload;

        // If recipient rejected the file, delete stored file
        if (!response) {
            delete this.files.outgoing[connection.peer];
        }

        Ember.$.publish('response.p2p', {
            connection: connection,
            response: response
        });

        console.log('Peer:\t File response: ', data);
        break;

    case 'block_request':
        var file = this.files.outgoing[connection.peer].file;

        // console.log('Peer:\t Block request: ', data.payload);

        this._sendBlock(connection, file, data.payload);
        break;
    default:
        console.log('Peer:\t Unknown message: ', data);
    }
};

WebRTC.prototype.getFileInfo = function (file) {
    return {
        lastModifiedDate: file.lastModifiedDate,
        name: file.name,
        size: file.size,
        type: file.type,
        chunksTotal: Math.ceil(file.size / WebRTC.CHUNK_MTU)
    };
};

WebRTC.prototype.sendFileInfo = function (connection, info) {
    var message = {
        type: 'info',
        payload: info
    };

    connection.send(JSON.stringify(message));
};

WebRTC.prototype.sendCancelRequest = function (connection) {
    var message = {
        type: 'cancel'
    };

    connection.send(JSON.stringify(message));
};

WebRTC.prototype.sendFileResponse = function (connection, response) {
    var message = {
            type: 'response',
            payload: response
        };

    if (response) {
        // If recipient accepted the file, request required space to store the file on HTML5 filesystem
        var incoming = this.files.incoming[connection.peer],
            info = incoming.info;

        new File({name: info.name, size: info.size, type: info.type})
        .then(function (file) {
            incoming.file = file;
            connection.send(JSON.stringify(message));
        });
    } else {
        // Otherwise, delete stored file info
        delete this.files.incoming[connection.peer];
        connection.send(JSON.stringify(message));
    }
};

WebRTC.prototype.sendFile = function (connection, file) {
    // Save the file for later
    this.files.outgoing[connection.peer] = {
        file: file,
        info: this.getFileInfo(file)
    };

    // Send the first block. Next ones will be requested by recipient.
    this._sendBlock(connection, file, 0);
};

WebRTC.prototype._requestFileBlock = function (connection, chunkNum) {
    var message = {
        type: 'block_request',
        payload: chunkNum
    };
    connection.send(JSON.stringify(message));
};

WebRTC.prototype._sendBlock = function (connection, file, beginChunkNum) {
    var info = this.files.outgoing[connection.peer].info,
        chunkSize = WebRTC.CHUNK_MTU,
        chunksPerAck = WebRTC.CHUNKS_PER_ACK,
        remainingChunks = info.chunksTotal - beginChunkNum,
        chunksToSend = Math.min(remainingChunks, chunksPerAck),
        endChunkNum = beginChunkNum + chunksToSend - 1,
        begin = beginChunkNum * chunkSize,
        end = endChunkNum * chunkSize + chunkSize,
        reader = new FileReader(),
        blockBlob, chunkNum;

    // Read the whole block from file
    blockBlob = file.slice(begin, end);

    // console.log('Sending block: start chunk: ' + beginChunkNum + ' end chunk: ' + endChunkNum);
    // console.log('Sending block: start byte : ' + begin + ' end byte : ' + end);

    reader.onload = function (event) {
        if (reader.readyState === FileReader.DONE) {
            var blockBuffer = event.target.result;

            for (chunkNum = beginChunkNum; chunkNum <  endChunkNum + 1; chunkNum++) {
                // Send each chunk (begin index is inclusive, end index is exclusive)
                var begin = (chunkNum % chunksPerAck) * chunkSize,
                    end = Math.min(begin + chunkSize, blockBuffer.byteLength),
                    chunkBuffer = blockBuffer.slice(begin, end);

                connection.send(chunkBuffer);

                // console.log('Sent chunk: start byte: ' + begin + ' end byte: ' + end + ' length: ' + chunkBuffer.byteLength);
                // console.log('Sent chunk no ' + (chunkNum + 1) + ' out of ' + info.chunksTotal);

                connection.emit('sending_progress', chunkNum / (info.chunksTotal - 1));
            }

            if (endChunkNum === info.chunksTotal - 1) {
                Ember.$.publish('file_sent.p2p', {connection: connection});
            }
        }
    };

    reader.readAsArrayBuffer(blockBlob);
};

export default WebRTC;
