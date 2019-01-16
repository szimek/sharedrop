export default {
  hasAnalytics() {
    return window.ga && typeof window.ga === 'function';
  },

  trackEvent(category, action, label, value) {
    if (this.hasAnalytics()) {
      window.ga('send', 'event', category, action, label, value);
    }
  },
};
