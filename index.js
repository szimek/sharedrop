'use strict';

if (process.env.NODE_ENV === 'production') {
    require('newrelic');
}

// Room server
var http = require('http'),
    path = require('path'),
    express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    compression = require('compression'),
    persona = require('express-persona'),
    uuid = require('node-uuid'),
    crypto = require('crypto'),
    FirebaseTokenGenerator = require("firebase-token-generator"),
    firebaseTokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET),
    app = express(),
    personaUrl= process.env.PERSONA_URL,
    secret = process.env.SECRET,
    base = ['dist'];

app.enable('trust proxy');

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
    cookie: {
        // secure: true,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    secret: secret,
    proxy: true
}));
app.use(compression());

//
// Web server
//
base.forEach(function (dir) {
    var subdirs = ['assets'];

    subdirs.forEach(function (subdir) {
        app.use('/' + subdir, express.static(dir + '/' + subdir, {
            maxAge: 31104000000 // ~1 year
        }));
    });
});

//
// API server
//

// Handle Persona authentication
persona(app, { audience: personaUrl });

app.get('/', function (req, res) {
    var root = path.join(__dirname, base[0]);
    res.sendfile(root + '/index.html');
});

app.get('/rooms/:id', function (req, res) {
    var root = path.join(__dirname, base[0]);
    res.sendfile(root + '/index.html');
});


app.get('/room', function (req, res) {
    var ip = req.headers['cf-connecting-ip'] || req.ip,
        name = crypto.createHmac('md5', secret).update(ip).digest('hex');

    res.json({name: name});
});

app.get('/auth', function (req, res) {
    var ip = req.headers['cf-connecting-ip'] || req.ip,
        uid = uuid.v1(),
        token = firebaseTokenGenerator.createToken(
            {uid: uid, id: uid}, // will be available in Firebase security rules as 'auth'
            {expires: 32503680000} // 01.01.3000 00:00
        );

    res.json({id: uid, token: token, public_ip: ip});
});

http.createServer(app)
.listen(process.env.PORT)
.on('listening', function () {
    console.log('Started ShareDrop web server...');
});
