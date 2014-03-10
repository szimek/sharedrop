ShareDrop
========

It uses PeerJS server at http://file-drop-peer-server.herokuapp.com.

## Setup
1. Run `npm -g install grunt-cli` to install Grunt.
1. Run `npm install` to install Node.js dependencies.
2. Run `bundle install` to install Ruby dependencies.
3. Run `cp .env{.sample,}` to create `.env` with required environment variables.
4. Run `grunt serve` to start the server on `localhost:8000`.

To run production build locally, run `grunt env:dev serve:dist`.
