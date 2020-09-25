module.exports = function () {
  return {
    clientAllowedKeys: ['FIREBASE_URL'],
    // Fail build when there is missing any of clientAllowedKeys environment variables.
    // By default false.
    failOnMissingKey: false,
  };
};
