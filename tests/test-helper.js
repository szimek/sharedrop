/* eslint */
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import Application from 'sharedrop/app';
import config from 'sharedrop/config/environment';

setApplication(Application.create(config.APP));

start();
