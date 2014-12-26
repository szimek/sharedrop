window.ShareDrop.App = Ember.Application.create({
    // LOG_TRANSITIONS: true,
    // LOG_TRANSITIONS_INTERNAL: true,
    // LOG_ACTIVE_GENERATION: true,
    // LOG_VIEW_LOOKUPS: true
});

ShareDrop.App.deferReadiness();

// Check if everything we need is available
(function () {
    checkWebRTCSupport()
    .then(clearFileSystem)
    .catch(function (error) {
        ShareDrop.App.error = error;
    })
    .then(authenticateToFirebase)
    .then(function () {
        ShareDrop.App.advanceReadiness();
    });

    function checkWebRTCSupport() {
        return new Promise(function (resolve, reject) {
            if (util.supports.sctp) {
                resolve();
            } else {
                reject('browser_unsupported');
            }
        });
    }

    function clearFileSystem() {
        return new Promise(function (resolve, reject) {
            ShareDrop.File.removeAll()
            .then(function () {
                resolve();
            })
            .catch(function () {
                reject('filesystem_unavailable');
            });
        });
    }

    function authenticateToFirebase() {
        return new Promise(function (resolve, reject) {
            var xhr = Ember.$.getJSON('/auth');
            xhr.then(function (data) {
                var ref = new Firebase(window.ENV.FIREBASE_URL);
                ShareDrop.App.ref = ref;
                ShareDrop.App.userId = data.id;
                ShareDrop.App.publicIp = data.public_ip;

                ref.authWithCustomToken(data.token, function (error) {
                    error ? reject(error) : resolve();
                });
            });
        });
    }
})();

ShareDrop.App.Router.reopen({
  location: 'auto'
});

ShareDrop.App.Router.map(function () {
    this.route('room', { path: '/rooms/:room_id' });
});

ShareDrop.App.ApplicationRoute = Ember.Route.extend({
    actions: {
        openModal: function (modalName) {
            return this.render(modalName, {
                outlet: 'modal',
                into: 'application'
            });
        },

        closeModal: function () {
            return this.disconnectOutlet({
                outlet: 'modal',
                parentView: 'application'
            });
        }
    }
});

ShareDrop.App.IndexRoute = Ember.Route.extend({
    beforeModel: function() {
        if (ShareDrop.App.error) {
            throw new Error(ShareDrop.App.error);
        }
    },

    model: function () {
        // Get room name from the server
        return $.getJSON('/room').then(function (data) {
            return data.name;
        });
    },

    setupController: function (ctrl, model) {
        ctrl.set('model', []);
        ctrl.set('hasCustomRoomName', false);

        // Handle room events
        $.subscribe('connected.room', ctrl._onRoomConnected.bind(ctrl));
        $.subscribe('disconnected.room', ctrl._onRoomDisconnected.bind(ctrl));
        $.subscribe('user_added.room', ctrl._onRoomUserAdded.bind(ctrl));
        $.subscribe('user_changed.room', ctrl._onRoomUserChanged.bind(ctrl));
        $.subscribe('user_removed.room', ctrl._onRoomUserRemoved.bind(ctrl));

        // Handle peer events
        $.subscribe('incoming_peer_connection.p2p', ctrl._onPeerP2PIncomingConnection.bind(ctrl));
        $.subscribe('incoming_dc_connection.p2p', ctrl._onPeerDCIncomingConnection.bind(ctrl));
        $.subscribe('incoming_dc_connection_error.p2p', ctrl._onPeerDCIncomingConnectionError.bind(ctrl));
        $.subscribe('outgoing_peer_connection.p2p', ctrl._onPeerP2POutgoingConnection.bind(ctrl));
        $.subscribe('outgoing_dc_connection.p2p', ctrl._onPeerDCOutgoingConnection.bind(ctrl));
        $.subscribe('outgoing_dc_connection_error.p2p', ctrl._onPeerDCOutgoingConnectionError.bind(ctrl));
        $.subscribe('disconnected.p2p', ctrl._onPeerP2PDisconnected.bind(ctrl));
        $.subscribe('info.p2p', ctrl._onPeerP2PFileInfo.bind(ctrl));
        $.subscribe('response.p2p', ctrl._onPeerP2PFileResponse.bind(ctrl));
        $.subscribe('file_canceled.p2p', ctrl._onPeerP2PFileCanceled.bind(ctrl));
        $.subscribe('file_received.p2p', ctrl._onPeerP2PFileReceived.bind(ctrl));
        $.subscribe('file_sent.p2p', ctrl._onPeerP2PFileSent.bind(ctrl));

        // Join the room
        var room = new ShareDrop.Room(model, ShareDrop.App.ref);
        room.join(ctrl.get('you').serialize());
        ctrl.set('room', room);
    },

    renderTemplate: function () {
        this.render();

        this.render('about_you', {
            into: 'application',
            outlet: 'about_you'
        });

        var key =  'show-instructions-for-app';
        if (!localStorage.getItem(key)) {
            this.send('openModal', 'about_app');
            localStorage.setItem(key, 'yup');
        }
    },

    actions: {
        willTransition: function () {
            $.unsubscribe('.room');
            $.unsubscribe('.p2p');

            this.controllerFor('index').get('room').leave();

            return true;
        }
    }
});

ShareDrop.App.RoomRoute = ShareDrop.App.IndexRoute.extend({
    controllerName: 'index',

    model: function (params) {
        // Get room name from params
        return params.room_id;
    },

    afterModel: function (model, transition) {
        transition.then(function (route) {
            route.controllerFor('application').set('currentUrl', window.location.href);
        });
    },

    setupController: function (ctrl, model) {
        this._super(ctrl, model);

        ctrl.set('hasCustomRoomName', true);
    },

    renderTemplate: function (ctrl, model) {
        this.render();

        this.render('about_you', {
            into: 'application',
            outlet: 'about_you'
        });

        var room = ctrl.get('room').name,
            key = 'show-instructions-for-room-' + room;

        if (sessionStorage.getItem(key)) {
            this.send('openModal', 'about_room');
            sessionStorage.removeItem(key);
        }
    }
});

ShareDrop.App.ErrorRoute = Ember.Route.extend({
    renderTemplate: function(controller, error) {
        var name = 'errors/' + error.message,
            template = Ember.TEMPLATES[name];

        if (template) this.render(name);
    }
});
