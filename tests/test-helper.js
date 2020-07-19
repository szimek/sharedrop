/* eslint */
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
// eslint-disable-next-line import/extensions
import Application from '../app';
// eslint-disable-next-line import/extensions
import config from '../config/environment';

setApplication(Application.create(config.APP));

start();
