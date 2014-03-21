module.exports.server = function (options) {
    'use strict';

    if (process.env.NODE_ENV === 'production') {
        require('newrelic');
    }

    // Room server
    var http = require('http'),
        path = require('path'),
        express = require('express'),
        uuid = require('node-uuid'),
        crypto = require('crypto'),
        persona = require('express-persona'),
        FirebaseTokenGenerator = require("firebase-token-generator"),
        firebaseTokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET),
        app = express(),
        personaUrl= process.env.PERSONA_URL,
        secret = process.env.SECRET,
        base;

    options = options || {};
    base = options.base || ['.'];

    app.use(express.logger());
    app.use(express.urlencoded());
    app.use(express.cookieParser());
    app.use(express.cookieSession({
        cookie: {
            // secure: true,
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        },
        secret: secret,
        proxy: true
    }));
    app.use(express.compress());
    app.use(express.json());

    base.forEach(function (dir) {
        ['scripts', 'styles', 'images', 'fonts'].forEach(function (subdir) {
            app.use('/' + subdir, express.static(dir + '/' + subdir, {
                maxAge: 31104000000 // ~1 year
            }));
        });
    });

    //
    // Web server
    //

    // Handle Persona authentication
    persona(app, { audience: personaUrl });

    app.get('/', function (req, res) {
        var root = path.join(__dirname, '..', base[0]);
        res.sendfile(root + '/index.html');
    });

    app.get('/room', function (req, res) {
        var ips = req.headers['x-forwarded-for'] || req.ip,
            ip = ips.split(',').pop().trim(),
            name = crypto.createHmac('md5', secret).update(ip).digest('hex');

        res.json({name: name, public_ip: ip});
    });

    app.get('/auth', function (req, res) {
        var id = uuid.v1(),
            token = firebaseTokenGenerator.createToken(
                {id: id}, // will be available in Firebase security rules as 'auth'
                {expires: 32503680000} // 01.01.3000 00:00
            );

        res.json({id: id, token: token});
    });

    return http.createServer(app);
};
