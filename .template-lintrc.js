'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'no-html-comments': false,
    'no-partial': false,
  },
  ignore: [
    './node_modules/**',
    './vendor/**',
    './tmp/**',
    './dist/**',
    './tests/**',
  ],
};
