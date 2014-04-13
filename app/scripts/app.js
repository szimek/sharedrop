window.ShareDrop.App = Ember.Application.create({});

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

                ref.auth(data.token, function (error) {
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
                into: 'index'
            });
        },

        closeModal: function () {
            return this.disconnectOutlet({
                outlet: 'modal',
                parentView: 'index'
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

        // Handle room events
        $.subscribe('connected.room', ctrl._onRoomConnected.bind(ctrl));
        $.subscribe('disconnected.room', ctrl._onRoomDisconnected.bind(ctrl));
        $.subscribe('user_added.room', ctrl._onRoomUserAdded.bind(ctrl));
        $.subscribe('user_changed.room', ctrl._onRoomUserChanged.bind(ctrl));
        $.subscribe('user_removed.room', ctrl._onRoomUserRemoved.bind(ctrl));

        // Handle peer events
        $.subscribe('incoming_connection.p2p.peer', ctrl._onPeerP2PIncomingConnection.bind(ctrl));
        $.subscribe('outgoing_connection.p2p.peer', ctrl._onPeerP2POutgoingConnection.bind(ctrl));
        $.subscribe('disconnected.p2p.peer', ctrl._onPeerP2PDisconnected.bind(ctrl));
        $.subscribe('info.p2p.peer', ctrl._onPeerP2PFileInfo.bind(ctrl));
        $.subscribe('response.p2p.peer', ctrl._onPeerP2PFileResponse.bind(ctrl));
        $.subscribe('file_canceled.p2p.peer', ctrl._onPeerP2PFileCanceled.bind(ctrl));
        $.subscribe('file_received.p2p.peer', ctrl._onPeerP2PFileReceived.bind(ctrl));
        $.subscribe('file_sent.p2p.peer', ctrl._onPeerP2PFileSent.bind(ctrl));

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

        if (!localStorage.seenInstructions) {
            this.send('openModal', 'about');
            localStorage.seenInstructions = 'yup';
        }
    },

    actions: {
        willTransition: function () {
            $.unsubscribe('.room');
            $.unsubscribe('.peer');

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

    actions: {
        willTransition: function () {
            $.unsubscribe('.room');
            $.unsubscribe('.peer');

            this.controllerFor('room').get('room').leave();

            return true;
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
