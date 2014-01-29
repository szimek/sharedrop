// TODO:
// - require process.env.SECRET

module.exports.server = function (options) {
    // Room server
    var http = require('http'),
        util = require('util'),
        express = require('express'),
        uuid = require('node-uuid'),
        crypto = require('crypto'),
        extend = require('deep-extend'),
        app = express(),
        host = process.env.HOST,
        port = process.env.PORT,
        webPort = process.env.WEB_PORT, // 80 or 443
        secret = process.env.SECRET,
        server, io;

    options = options  || {};
    base = options.base || ['.'];

    app.use(express.urlencoded());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: secret
    }));
    app.use(express.compress());
    app.use(express.json());

    // TODO
    base.forEach(function (dir) {
        app.use('/scripts', express.static(dir + '/scripts'));
        app.use('/styles', express.static(dir + '/styles'));
    });

    //
    // Web server
    //

    // Handle Persona authentication
    require('express-persona')(app, {
      audience: 'http://' + host + ':' + webPort
    });

    app.get('/', function (req, res) {
        res.sendfile(__dirname + '/index.html');
    });

    app.get('/room', function (req, res) {
        var ip = req.headers['x-forwarded-for'] || req.ip,
            name = crypto.createHmac('md5', secret).update(ip).digest('hex');

        res.json({
            name: name,
            uuid: uuid.v1(),
            public_ip: ip
        });
    });

    //
    // Room server
    //
    server = http.createServer(app);
    io = require('socket.io').listen(server);

    io.sockets.on('connection', function (client) {

        // When a peer joins a room, send back list of other peers already there
        client.on('join', function (data) {
            var room = data.room,
                peer = data.peer;

            console.log('on:join', data);
            client.peer = peer;

            var clients = io.sockets.clients(room),
                peers = clients.map(function (client) {return client.peer;});

            // Send back list of other peers in the room
            client.emit('user_list', peers);

            // Join the room
            client.join(room);

            // Notify other peers that a new peer has joined the room
            client.broadcast.to(room).emit('user_added', client.peer);

            // Notify other peers when a peer leaves the room
            client.on('disconnect', function () {
                client.broadcast.to(room).emit('user_removed', client.peer);
            });

            console.log('on:join', peers);
        });

        client.on('update', function (data) {
            var room = data.room,
                peer = data.peer;

            extend(client.peer, peer);

            client.broadcast.to(room).emit('user_changed', client.peer);
        });
    });

    return server;
};

