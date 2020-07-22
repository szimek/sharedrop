export default {
  trackEvent(name, parameters) {
    if (window.gtag && typeof window.gtag === 'function') {
      window.gtag('event', name, parameters);
    }
  },
};
