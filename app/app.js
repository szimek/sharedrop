import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'sharedrop/config/environment';
import * as Sentry from '@sentry/browser';
import { Ember as EmberIntegration } from '@sentry/integrations';

Sentry.init({
  dsn:
    'https://ba1292a9c759401dbbda4272f183408d@o432021.ingest.sentry.io/5384091',
  integrations: [new EmberIntegration()],
});

export default class App extends Application {
  modulePrefix = config.modulePrefix;

  podModulePrefix = config.podModulePrefix;

  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
