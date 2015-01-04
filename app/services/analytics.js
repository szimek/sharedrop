import Ember from 'ember';

var Analytics = {
    hasAnalytics: function () {
        return window.ga && typeof window.ga === "function";
    },

    trackEvent: function (category, action, label, value) {
        if (this.hasAnalytics()) {
            window.ga('send', 'event', category, action, label, value);
        }
    }
};

// TODO: run it in initializer?
(function () {
    Ember.$.subscribe('file_received.p2p', function (event, data) {
        Analytics.trackEvent('file', 'transferred', 'size', data.info.size);
    });
})();

export default Analytics;
