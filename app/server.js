// TODO:
// - require process.env.SECRET

module.exports.server = function (options) {
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
        host = process.env.HOST,
        webPort = process.env.WEB_PORT, // 80 or 443
        secret = process.env.SECRET,
        base;

    options = options || {};
    base = options.base || ['.'];

    app.use(express.logger());
    app.use(express.urlencoded());
    app.use(express.cookieParser());
    app.use(express.session({ secret: secret }));
    app.use(express.compress());
    app.use(express.json());

    base.forEach(function (dir) {
        ['scripts', 'styles', 'images', 'fonts'].forEach(function (subdir) {
            app.use('/' + subdir, express.static(dir + '/' + subdir));
        });
    });

    //
    // Web server
    //

    // Handle Persona authentication
    persona(app, { audience: 'http://' + host + ':' + webPort });

    app.get('/', function (req, res) {
        var root = path.join(__dirname, '..', base[0]);
        res.sendfile(root + '/index.html');
    });

    app.get('/room', function (req, res) {
        var ip = req.headers['x-forwarded-for'] || req.ip,
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
