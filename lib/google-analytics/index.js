const { name } = require('./package');

module.exports = {
  name,

  isDevelopingAddon() {
    return true;
  },

  contentFor(type, config) {
    const id = config.googleAnalyticsId;

    if (type === 'head' && id) {
      return `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        </script>
      `;
    }

    return '';
  },
};
