ShareDrop.Analytics = {
    hasAnalytics: function () {
        return window.ga && typeof window.ga === "function";
    },

    trackEvent: function (category, action, label, value) {
        if (ShareDrop.Analytics.hasAnalytics()) {
            window.ga('send', 'event', category, action, label, value);
        }
    }
};

(function () {
    $.subscribe('file_received.p2p.peer', function (event, data) {
        ShareDrop.Analytics.trackEvent('file', 'transferred', 'size', data.info.size);
    });
})();
