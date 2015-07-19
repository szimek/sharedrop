/* global require, module */
var EmberApp = require("ember-cli/lib/broccoli/ember-app");
var env = process.env.EMBER_ENV;
var config = require("./config/environment")(env);

module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
        dotEnv: {
            clientAllowedKeys: ['FIREBASE_URL']
        },

        inlineContent: {
            "analytics": {
                file: "app/analytics.html",
                enabled: !!config.GOOGLE_ANALYTICS_ID,
                postProcess: function (content) {
                    return content.replace(/\{\{GOOGLE_ANALYTICS_ID\}\}/g, config.GOOGLE_ANALYTICS_ID);
                }
            }
        }
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

  app.import('vendor/peer.js');
  app.import('vendor/filer.min.js');
  app.import('vendor/ba-tiny-pubsub.min.js');
  app.import('vendor/idb.filesystem.min.js');
  app.import('vendor/underscore.js');
  app.import('vendor/jquery-uuid.js');
  app.import('bower_components/bootstrap/dist/js/bootstrap.min.js');

  return app.toTree();
};
