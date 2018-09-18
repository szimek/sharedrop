/* global process, require, __dirname */

'use strict';

if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

// Room server
const http = require('http');
const path = require('path');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const compression = require('compression');
const uuid = require('node-uuid');
const crypto = require('crypto');
const app = express();
const secret = process.env.SECRET;
const base = ['dist'];
const firebase = require("firebase");
const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DB_URL,
  storageBucket: process.env.PROCESS_BUCKET
}

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

firebase.initializeApp(config);
//
// Web server
//
base.forEach((dir) => {
  const subdirs = ['assets'];

  subdirs.forEach((subdir) => {
    app.use('/' + subdir, express.static(dir + '/' + subdir, {
      maxAge: 31104000000 // ~1 year
    }));
  });
});

//
// API server
//
app.get('/', (req, res) => {
  const root = path.join(__dirname, base[0]);
  res.sendfile(root + '/index.html');
});

app.get('/rooms/:id', (req, res) => {
  const root = path.join(__dirname, base[0]);
  res.sendfile(root + '/index.html');
});


app.get('/room', (req, res) => {
  const ip = req.headers['cf-connecting-ip'] || req.ip;
  const name = crypto.createHmac('md5', secret).update(ip).digest('hex');

  res.json({name: name});
});

app.get('/auth', (req, res) => {
  const ip = req.headers['cf-connecting-ip'] || req.ip;
  const uid = uuid.v1();

  res.json({id: uid, public_ip: ip});
});

http
  .createServer(app)
  .listen(process.env.PORT)
  .on('listening', () => {
    console.log(`Started ShareDrop web server at http://localhost:${process.env.PORT}...`);
  });
