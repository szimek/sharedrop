# ![ShareDrop](https://www.sharedrop.io/assets/images/sharedrop.svg)

ShareDrop is HTML5 clone of Apple [AirDrop](http://support.apple.com/kb/ht4783) service. It allows you to transfer files directly between devices, without having to upload them to any server first. It uses [WebRTC](http://www.webrtc.org) for secure peer-to-peer file transfer and [Firebase](https://www.firebase.com) for presence management and WebRTC signaling.

ShareDrop allows you to send files to other devices in the same local network (i.e. devices with the same public IP address) without any configuration - simply open <https://www.sharedrop.io> on all devices and they will see each other. It also allows you to send files between networks - just click + button in the top right corner of the page to create a room with unique URL and share this URL with other people you want to send a file to. Once they open this page in a browser on their devices, you'll see each other's avatars.

The main difference between ShareDrop and AirDrop is that ShareDrop requires Internet connection to discover other devices, while AirDrop doesn't need one - it creates ad-hoc wireless network between them. On the other hand, ShareDrop allows you to share files between mobile (Android) and desktop devices and between networks as well.

### Supported browsers
*   Chrome (desktop and Android) 33+
*   Opera (desktop and Android) 20+
*   Firefox (desktop and Android) 28+
*   Safari (desktop) 12+

### How to set it up for local development
1.  Setup Firebase:
    1.  [Sign up](https://www.firebase.com) for a Firebase account and create a database.
    2.  Go to "Security Rules" tab, click "Load Rules" button and select `firebase_rules.json` file.
    3.  Take note of your database URL and its secret, which can be found in "Secrets" tab.
2.  Run `npm install -g ember-cli` to install Ember CLI.
3.  Run `ember install` to install app dependencies.
4.  Run `cp .env{.sample,}` to create `.env` file. This file will be used by Foreman to set environment variables when running the app locally.
    -   `SECRET` key is used to encrypt cookies and generate room name based on public IP address for `/` route. It can be any random string - you can generate one using e.g. `date | md5sum`
    -   `NEW_RELIC_*` keys are only necessary in production
5.  Run `npm run dev` to start the app.

### Deployment
#### Heroku
When deploying to Heroku, use [multi buildpack](https://github.com/heroku/heroku-buildpack-multi.git).

For new apps:
```
heroku create myapp --buildpack https://github.com/heroku/heroku-buildpack-multi.git
```

For existing apps:
```
heroku config:set BUILDPACK_URL=https://github.com/heroku/heroku-buildpack-multi.git
```

Then run
```
heroku config:set NPM_CONFIG_PRODUCTION=false
```
to make Node.js buildpack install development dependencies necessary to build Ember CLI app as well as the production ones.

It uses the default [Heroku Node.js buildpack](https://github.com/heroku/heroku-buildpack-nodejs) to install Node.js, npm and Node.js packages and then uses [Ember CLI buildpack](https://github.com/szimek/heroku-buildpack-ember-cli-without-webserver) to install Bower packages and build Ember CLI app.
