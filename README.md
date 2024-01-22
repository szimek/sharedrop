<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/9873/200137755-47fe06a7-3c37-439f-b44c-cee9168418fa.svg">
  <img alt="ShareDrop" src="https://user-images.githubusercontent.com/9873/200137972-bfd145a2-36eb-48ad-8568-53184d3599c1.svg">
</picture>

ShareDrop is a web application inspired by Apple [AirDrop](http://support.apple.com/kb/ht4783) service. It allows you to transfer files directly between devices, without having to upload them to any server first. It uses [WebRTC](http://www.webrtc.org) for secure peer-to-peer file transfer and [Firebase](https://www.firebase.com) for presence management and WebRTC signaling.

ShareDrop allows you to send files to other devices in the same local network (i.e. devices with the same public IP address) without any configuration - simply open <https://www.sharedrop.io> on all devices and they will see each other. It also allows you to send files between networks - just click the `+` button in the top right corner of the page to create a room with a unique URL and share this URL with other people you want to send a file to. Once they open this page in a browser on their devices, you'll see each other's avatars.

The main difference between ShareDrop and AirDrop is that ShareDrop requires Internet connection to discover other devices, while AirDrop doesn't need one, as it creates ad-hoc wireless network between them. On the other hand, ShareDrop allows you to share files between mobile (Android and iOS) and desktop devices and even between networks.

## Support ShareDrop!

ShareDrop is free, however, it still costs money to run.

If you use it and like it, please consider making a small donation either via

[PayPal](https://www.paypal.com/donate/?business=99MJKQUTTQVYY&no_recurring=0&item_name=Help+cover+the+server+costs+for+sharedrop.io&currency_code=EUR)

or

[![Support ShareDrop](https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-1.svg)](https://www.buymeacoffee.com/sharedropio)

to help me keep it free for everyone. Thanks!

## Supported browsers

- Chrome
- Edge (Chromium based)
- Firefox
- Opera
- Safari 13+

## Local development

1.  Setup Firebase:
    1.  [Sign up](https://www.firebase.com) for a Firebase account and create a database.
    2.  Go to "Security Rules" tab, click "Load Rules" button and select `firebase_rules.json` file.
    3.  Take note of your database URL and its secret, which can be found in "Secrets" tab.
2.  Run `npm install -g ember-cli` to install Ember CLI.
3.  Run `yarn` to install app dependencies.
4.  Run `cp .env{.sample,}` to create `.env` file. This file will be used by Foreman to set environment variables when running the app locally.
    - `SECRET` key is used to encrypt cookies and generate room name based on public IP address for `/` route. It can be any random string - you can generate one using e.g. `openssl rand -hex 32`
    - `NEW_RELIC_*` keys are only necessary in production
5.  Run `yarn develop` to start the app.

## Deployment

### Heroku

Create a new Heroku app:

```
heroku create <app-name>
```

and push the app to Heroku repo:

```
git push heroku master
```
