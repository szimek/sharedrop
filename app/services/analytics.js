export default {
    hasAnalytics: function () {
        return window.ga && typeof window.ga === "function";
    },

    trackEvent: function (category, action, label, value) {
        if (this.hasAnalytics()) {
            window.ga('send', 'event', category, action, label, value);
        }
    }
};
