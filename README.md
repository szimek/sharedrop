# ![ShareDrop](https://www.sharedrop.io/images/a2781750.sharedrop.svg)

ShareDrop is HTML5 clone of Apple [AirDrop](http://support.apple.com/kb/ht4783) service. It allows you to transfer files directly between devices, without having to upload them to any server first. It uses [WebRTC](http://www.webrtc.org) for secure peer-to-peer file transfer and [Firebase](https://www.firebase.com) for presence management and WebRTC signaling.

ShareDrop allows you to send files to other devices in the same local network (i.e. devices with the same public IP address) without any configuration - simply open https://www.sharedrop.io on all devices and they will see each other. It also allows you to send files between networks, however, there's no UI for that feature yet - at the moment you'll have to manually enter unique URL like https://www.sharedrop.io/rooms/your-room-name on all devices.

The main difference between ShareDrop and AirDrop is that ShareDrop requires Internet connection to discover other devices, while AirDrop doesn't need one - it creates ad-hoc wireless network between them. On the other hand, ShareDrop allows you to share files between mobile (Android) and desktop devices and between networks as well.

### Supported browsers
* Chrome (desktop and Android) 33+
* Opera (desktop and Android) 20+
* Firefox (desktop and Android) 28+ (though we suggest using Chrome or Opera for transferring larger files)

### How to set it up for local development
1. Setup Firebase:
    1. [Sign up](https://www.firebase.com) for a Firebase account and create a database.
    2. Go to "Security Rules" tab, click "Load Rules" button and select `firebase_rules.json` file.
    3. Take note of your database URL and its secret, which can be found in "Secrets" tab.
2. Run `npm -g install grunt-cli` to install Grunt.
3. Run `npm install` to install NodeJS dependencies.
4. Run `bundle install` to install Ruby dependencies.
5. Run `cp .env{.sample,}` to create `.env` file. This file will be used by Grunt to set environemnt variables when running the app locally. You only need `NEW_RELIC_*` variables in production.
6. Run `grunt serve` to start the app.
7. Run `grunt build` to build production version of the app to `dist` directory.

### Deployment
When deploying to Heroku, use [multi buildpack](https://github.com/ddollar/heroku-buildpack-multi.git).

For new apps:

`heroku create myapp --buildpack https://github.com/ddollar/heroku-buildpack-multi.git`

For existing apps:

`heroku config:set BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git`
