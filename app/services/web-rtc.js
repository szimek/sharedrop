// TODO:
// - provide TURN server config once it's possible to create rooms with custom names
// - use Ember.Object.extend()

import Ember from 'ember'
import File from './file'

class WebRTC {
	constructor(id, options) {
	    let defaults = {
	        config: {'iceServers': [
	            { url: 'stun:stun.l.google.com:19302' }
	        ]},
	        debug: 3
	    }

	    this.conn = new window.Peer(id, Ember.$.extend(defaults, options))

	    this.files = {
	        outgoing: {},
	        incoming: {}
	    }

	    // Listen for incoming connections
	    this.conn.on('connection', connection => {
	        Ember.$.publish('incoming_peer_connection.p2p', {connection})

	        connection.on('open', () => {
	            console.log('Peer:\t Data channel connection opened: ', connection)
	            Ember.$.publish('incoming_dc_connection.p2p', {connection})
	        })

	        connection.on('error', error => {
	            console.log('Peer:\t Data channel connection error', error)
	            Ember.$.publish('incoming_dc_connection_error.p2p', {connection, error})
	        })

	        this._onConnection(connection)
	    })

	    this.conn.on('close', () =>
	        console.log('Peer:\t Connection to server closed.')
	    )

	    this.conn.on('error', error =>
	        console.log('Peer:\t Error while connecting to server: ', error)
	    )
	}

	connect(id) {
		let connection = this.conn.connect(id, {
			label: 'file',
			reliable: true,
			serialization: 'none' // we handle serialization ourselves
		})

		connection.on('open', () => {
			console.log('Peer:\t Data channel connection opened: ', connection)
			Ember.$.publish('outgoing_dc_connection.p2p', {connection})
		})

		connection.on('error', error => {
			console.log('Peer:\t Data channel connection error', error)
			Ember.$.publish('outgoing_dc_connection_error.p2p', {connection, error})
		})

		Ember.$.publish('outgoing_peer_connection.p2p', {connection})
		this._onConnection(connection)
	}


	_onConnection(connection) {
		console.log('Peer:\t Opening data channel connection...', connection)

		connection.on('data', data => {
			// Lame type check
			if (data.byteLength !== undefined) {
				// ArrayBuffer
				this._onBinaryData(data, connection)
			} else {
				// JSON string
				this._onJSONData(JSON.parse(data), connection)
			}
		})

		connection.on('close', () => {
			Ember.$.publish('disconnected.p2p', {connection})
			console.log('Peer:\t P2P connection closed: ', connection)
		})
	}

	_onBinaryData(data, connection) {
		let incoming = this.files.incoming[connection.peer],
			info = incoming.info,
			file = incoming.file,
			block = incoming.block,
			receivedChunkNum = incoming.receivedChunkNum,
			chunksPerAck = WebRTC.CHUNKS_PER_ACK,
			nextChunkNum, lastChunkInFile, lastChunkInBlock

		// TODO move it after requesting a new block to speed things up
		connection.emit('receiving_progress', (receivedChunkNum + 1) / info.chunksTotal)
		// console.log(`Got chunk no ${receivedChunkNum + 1} out of ${info.chunksTotal}`)

		block.push(data)

		nextChunkNum = incoming.receivedChunkNum = receivedChunkNum + 1
		lastChunkInFile = receivedChunkNum === info.chunksTotal - 1
		lastChunkInBlock = receivedChunkNum > 0 && ((receivedChunkNum + 1) % chunksPerAck) === 0

		if (lastChunkInFile || lastChunkInBlock) {
			file.append(block).then(() => {
				if (lastChunkInFile) {
					file.save()

					Ember.$.publish('file_received.p2p', {
						blob: file,
						info,
						connection
					})
				} else {
					// console.log(`Requesting block starting at: ${nextChunkNum}`)
					incoming.block = []
					this._requestFileBlock(connection, nextChunkNum)
				}
			})
		}
	}

	_onJSONData(data, connection) {
		switch (data.type) {
		case 'info':
			let info = data.payload

			Ember.$.publish('info.p2p', {connection, info})

			// Store incoming file info for later
			this.files.incoming[connection.peer] = {
				info,
				file: null,
				block: [],
				receivedChunkNum: 0
			}

			console.log('Peer:\t File info: ', data)
			break

		case 'cancel':
			Ember.$.publish('file_canceled.p2p', {connection})

			console.log('Peer:\t Sender canceled file transfer')
			break

		case 'response':
			let response = data.payload

			// If recipient rejected the file, delete stored file
			if (!response)
				delete this.files.outgoing[connection.peer]


			Ember.$.publish('response.p2p', {connection, response})

			console.log('Peer:\t File response: ', data)
			break

		case 'block_request':
			let file = this.files.outgoing[connection.peer].file

			// console.log('Peer:\t Block request: ', data.payload)

			this._sendBlock(connection, file, data.payload)
			break
		default:
			console.log('Peer:\t Unknown message: ', data)
		}
	}

	getFileInfo(file) {
		return {
			lastModifiedDate: file.lastModifiedDate,
			name: file.name,
			size: file.size,
			type: file.type,
			chunksTotal: Math.ceil(file.size / WebRTC.CHUNK_MTU)
		}
	}

	sendFileInfo(connection, info) {
		let message = {
			type: 'info',
			payload: info
		}

		connection.send(JSON.stringify(message))
	}

	sendCancelRequest(connection) {
		let message = {
			type: 'cancel'
		}

		connection.send(JSON.stringify(message))
	}

	sendFileResponse(connection, response) {
		let message = {
			type: 'response',
			payload: response
		}

		if (response) {
			// If recipient accepted the file, request required space to store the file on HTML5 filesystem
			let incoming = this.files.incoming[connection.peer],
				info = incoming.info

			new File({name: info.name, size: info.size, type: info.type})
			.then(file => {
				incoming.file = file
				connection.send(JSON.stringify(message))
			})
		} else {
			// Otherwise, delete stored file info
			delete this.files.incoming[connection.peer]
			connection.send(JSON.stringify(message))
		}
	}

	sendFile(connection, file) {
		// Save the file for later
		this.files.outgoing[connection.peer] = {
			file: file,
			info: this.getFileInfo(file)
		}

		// Send the first block. Next ones will be requested by recipient.
		this._sendBlock(connection, file, 0)
	}

	_requestFileBlock(connection, chunkNum) {
		let message = {
			type: 'block_request',
			payload: chunkNum
		}
		connection.send(JSON.stringify(message))
	}

	_sendBlock(connection, file, beginChunkNum) {
		let info = this.files.outgoing[connection.peer].info,
			chunkSize = WebRTC.CHUNK_MTU,
			chunksPerAck = WebRTC.CHUNKS_PER_ACK,
			remainingChunks = info.chunksTotal - beginChunkNum,
			chunksToSend = Math.min(remainingChunks, chunksPerAck),
			endChunkNum = beginChunkNum + chunksToSend - 1,
			begin = beginChunkNum * chunkSize,
			end = endChunkNum * chunkSize + chunkSize,
			reader = new FileReader(),
			blockBlob, chunkNum

		// Read the whole block from file
		blockBlob = file.slice(begin, end)

		// console.log(`Sending block: start chunk: ${beginChunkNum} end chunk: ${endChunkNum}`)
		// console.log(`Sending block: start byte : ${begin} end byte : ${end}`)

		reader.onload = event => {
			if (reader.readyState === FileReader.DONE) {
				let blockBuffer = event.target.result

				for (chunkNum = beginChunkNum; chunkNum <  endChunkNum + 1; chunkNum++) {
					// Send each chunk (begin index is inclusive, end index is exclusive)
					let begin = (chunkNum % chunksPerAck) * chunkSize,
						end = Math.min(begin + chunkSize, blockBuffer.byteLength),
						chunkBuffer = blockBuffer.slice(begin, end)

					connection.send(chunkBuffer)

					// console.log('Sent chunk: start byte: ' + begin + ' end byte: ' + end + ' length: ' + chunkBuffer.byteLength)
					// console.log('Sent chunk no ' + (chunkNum + 1) + ' out of ' + info.chunksTotal)

					connection.emit('sending_progress', (chunkNum + 1) / info.chunksTotal)
				}

				if (endChunkNum === info.chunksTotal - 1)
					Ember.$.publish('file_sent.p2p', {connection})
			}
		}

		reader.readAsArrayBuffer(blockBlob)
	}
}

WebRTC.CHUNK_MTU = 16000
WebRTC.CHUNKS_PER_ACK = 64

export default WebRTC
