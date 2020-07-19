const eslintPluginNode = require('eslint-plugin-node');

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['ember', 'prettier'],
  extends: ['airbnb-base', 'plugin:ember/recommended', 'prettier'],
  env: {
    browser: true,
  },
  rules: {
    'func-names': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'off',

    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',

    'prettier/prettier': 'error',

    // TODO: Enable these
    'ember/no-jquery': 'off',
    'ember/no-observers': 'off',
    'ember/no-get': 'off',
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: {
        ...eslintPluginNode.configs.recommended.rules,
        // add your custom rules and overrides for node files here

        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off',
      },
    },
  ],
};
