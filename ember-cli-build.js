/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Don't include SVG files, because of animal icons being loaded dynamically
    fingerprint: {
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map'],
    },

    // Generate source maps in production as well
    sourcemaps: { enabled: true },

    sassOptions: { extension: 'sass' },

    SRI: { enabled: false },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('vendor/ba-tiny-pubsub.min.js');
  app.import('vendor/filer.min.js');
  app.import('vendor/idb.filesystem.min.js');
  app.import('vendor/peer.js');

  return app.toTree();
};
