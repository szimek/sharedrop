module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
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

    strict: 'off',

    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',

    'prettier/prettier': 'error',
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
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015,
      },
      env: {
        browser: false,
        node: true,
      },
    },
  ],
};
