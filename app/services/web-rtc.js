// TODO:
// - provide TURN server config once it's possible to create rooms with custom names
// - use Ember.Object.extend()

import $ from 'jquery';
import File from './file';

const WebRTC = function(id, options) {
  const defaults = {
    config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] },
    debug: 3,
  };

  this.conn = new window.Peer(id, $.extend(defaults, options));

  this.files = {
    outgoing: {},
    incoming: {},
  };

  // Listen for incoming connections
  this.conn.on('connection', (connection) => {
    $.publish('incoming_peer_connection.p2p', { connection });

    connection.on('open', () => {
      console.log('Peer:\t Data channel connection opened: ', connection);
      $.publish('incoming_dc_connection.p2p', { connection });
    });

    connection.on('error', (error) => {
      console.log('Peer:\t Data channel connection error', error);
      $.publish('incoming_dc_connection_error.p2p', {
        connection,
        error,
      });
    });

    this._onConnection(connection);
  });

  this.conn.on('close', () => {
    console.log('Peer:\t Connection to server closed.');
  });

  this.conn.on('error', (error) => {
    console.log('Peer:\t Error while connecting to server: ', error);
  });
};

WebRTC.CHUNK_MTU = 16000;
WebRTC.CHUNKS_PER_ACK = 64;

WebRTC.prototype.connect = function(id) {
  const connection = this.conn.connect(
    id,
    {
      label: 'file',
      reliable: true,
      serialization: 'none', // we handle serialization ourselves
    }
  );

  connection.on('open', () => {
    console.log('Peer:\t Data channel connection opened: ', connection);
    $.publish('outgoing_dc_connection.p2p', { connection });
  });

  connection.on('error', (error) => {
    console.log('Peer:\t Data channel connection error', error);
    $.publish('outgoing_dc_connection_error.p2p', {
      connection,
      error,
    });
  });

  $.publish('outgoing_peer_connection.p2p', { connection });
  this._onConnection(connection);
};

WebRTC.prototype._onConnection = function(connection) {
  const self = this;

  console.log('Peer:\t Opening data channel connection...', connection);

  connection.on('data', (data) => {
    // Lame type check
    if (data.byteLength !== undefined) {
      // ArrayBuffer
      self._onBinaryData(data, connection);
    } else {
      // JSON string
      self._onJSONData(JSON.parse(data), connection);
    }
  });

  connection.on('close', () => {
    $.publish('disconnected.p2p', { connection });
    console.log('Peer:\t P2P connection closed: ', connection);
  });
};

WebRTC.prototype._onBinaryData = function(data, connection) {
  const self = this;
  const incoming = this.files.incoming[connection.peer];
  const { info, file, block, receivedChunkNum } = incoming;
  const chunksPerAck = WebRTC.CHUNKS_PER_ACK;

  // TODO move it after requesting a new block to speed things up
  connection.emit(
    'receiving_progress',
    (receivedChunkNum + 1) / info.chunksTotal
  );
  // console.log('Got chunk no ' + (receivedChunkNum + 1) + ' out of ' + info.chunksTotal);

  block.push(data);

  incoming.receivedChunkNum = receivedChunkNum + 1;
  const nextChunkNum = incoming.receivedChunkNum;
  const lastChunkInFile = receivedChunkNum === info.chunksTotal - 1;
  const lastChunkInBlock =
    receivedChunkNum > 0 && (receivedChunkNum + 1) % chunksPerAck === 0;

  if (lastChunkInFile || lastChunkInBlock) {
    file.append(block).then(() => {
      if (lastChunkInFile) {
        file.save();

        $.publish('file_received.p2p', {
          blob: file,
          info,
          connection,
        });
      } else {
        // console.log('Requesting block starting at: ' + (nextChunkNum));
        incoming.block = [];
        self._requestFileBlock(connection, nextChunkNum);
      }
    });
  }
};

WebRTC.prototype._onJSONData = function(data, connection) {
  switch (data.type) {
    case 'info': {
      const info = data.payload;

      $.publish('info.p2p', {
        connection,
        info,
      });

      // Store incoming file info for later
      this.files.incoming[connection.peer] = {
        info,
        file: null,
        block: [],
        receivedChunkNum: 0,
      };

      console.log('Peer:\t File info: ', data);
      break;
    }
    case 'cancel': {
      $.publish('file_canceled.p2p', {
        connection,
      });

      console.log('Peer:\t Sender canceled file transfer');
      break;
    }
    case 'response': {
      const response = data.payload;

      // If recipient rejected the file, delete stored file
      if (!response) {
        delete this.files.outgoing[connection.peer];
      }

      $.publish('response.p2p', {
        connection,
        response,
      });

      console.log('Peer:\t File response: ', data);
      break;
    }
    case 'block_request': {
      const { file } = this.files.outgoing[connection.peer];

      // console.log('Peer:\t Block request: ', data.payload);

      this._sendBlock(connection, file, data.payload);
      break;
    }
    default:
      console.log('Peer:\t Unknown message: ', data);
  }
};

WebRTC.prototype.getFileInfo = function(file) {
  return {
    lastModifiedDate: file.lastModifiedDate,
    name: file.name,
    size: file.size,
    type: file.type,
    chunksTotal: Math.ceil(file.size / WebRTC.CHUNK_MTU),
  };
};

WebRTC.prototype.sendFileInfo = function(connection, info) {
  const message = {
    type: 'info',
    payload: info,
  };

  connection.send(JSON.stringify(message));
};

WebRTC.prototype.sendCancelRequest = function(connection) {
  const message = {
    type: 'cancel',
  };

  connection.send(JSON.stringify(message));
};

WebRTC.prototype.sendFileResponse = function(connection, response) {
  const message = {
    type: 'response',
    payload: response,
  };

  if (response) {
    // If recipient accepted the file, request required space to store the file on HTML5 filesystem
    const incoming = this.files.incoming[connection.peer];
    const { info } = incoming;

    new File({ name: info.name, size: info.size, type: info.type }).then(
      (file) => {
        incoming.file = file;
        connection.send(JSON.stringify(message));
      }
    );
  } else {
    // Otherwise, delete stored file info
    delete this.files.incoming[connection.peer];
    connection.send(JSON.stringify(message));
  }
};

WebRTC.prototype.sendFile = function(connection, file) {
  // Save the file for later
  this.files.outgoing[connection.peer] = {
    file,
    info: this.getFileInfo(file),
  };

  // Send the first block. Next ones will be requested by recipient.
  this._sendBlock(connection, file, 0);
};

WebRTC.prototype._requestFileBlock = function(connection, chunkNum) {
  const message = {
    type: 'block_request',
    payload: chunkNum,
  };
  connection.send(JSON.stringify(message));
};

WebRTC.prototype._sendBlock = function(connection, file, beginChunkNum) {
  const { info } = this.files.outgoing[connection.peer];
  const chunkSize = WebRTC.CHUNK_MTU;
  const chunksPerAck = WebRTC.CHUNKS_PER_ACK;
  const remainingChunks = info.chunksTotal - beginChunkNum;
  const chunksToSend = Math.min(remainingChunks, chunksPerAck);
  const endChunkNum = beginChunkNum + chunksToSend - 1;
  const blockBegin = beginChunkNum * chunkSize;
  const blockEnd = endChunkNum * chunkSize + chunkSize;
  const reader = new FileReader();
  let chunkNum;

  // Read the whole block from file
  const blockBlob = file.slice(blockBegin, blockEnd);

  // console.log('Sending block: start chunk: ' + beginChunkNum + ' end chunk: ' + endChunkNum);
  // console.log('Sending block: start byte : ' + begin + ' end byte : ' + end);

  reader.onload = function(event) {
    if (reader.readyState === FileReader.DONE) {
      const blockBuffer = event.target.result;

      for (
        chunkNum = beginChunkNum;
        chunkNum < endChunkNum + 1;
        chunkNum += 1
      ) {
        // Send each chunk (begin index is inclusive, end index is exclusive)
        const bufferBegin = (chunkNum % chunksPerAck) * chunkSize;
        const bufferEnd = Math.min(
          bufferBegin + chunkSize,
          blockBuffer.byteLength
        );
        const chunkBuffer = blockBuffer.slice(bufferBegin, bufferEnd);

        connection.send(chunkBuffer);

        // console.log('Sent chunk: start byte: ' + begin + ' end byte: ' + end + ' length: ' + chunkBuffer.byteLength);
        // console.log('Sent chunk no ' + (chunkNum + 1) + ' out of ' + info.chunksTotal);

        connection.emit('sending_progress', (chunkNum + 1) / info.chunksTotal);
      }

      if (endChunkNum === info.chunksTotal - 1) {
        $.publish('file_sent.p2p', { connection });
      }
    }
  };

  reader.readAsArrayBuffer(blockBlob);
};

export default WebRTC;
