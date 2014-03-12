ShareDrop.Room = function (firebaseRef) {
    this._ref = firebaseRef;
    this.name = null;
};

ShareDrop.Room.prototype.join = function (user) {
    var self = this;

    // Get room name
    $.getJSON('/room')

    // Join room and listen for changes
    .then(function (data) {
        self.name = data.name;
        user.public_ip = data.public_ip;

        // Setup Firebase refs
        self._roomRef = self._ref.child('rooms/' + self.name);
        self._usersRef = self._roomRef.child('users');
        self._userRef = self._usersRef.child(user.uuid);

        // Remove yourself from the room when disconnected
        self._userRef.onDisconnect().remove();

        // Join the room
        self._userRef.set(user, function (error) {
            $.publish('connected.room', user);
        });

        self._usersRef.on('child_added', function (snapshot) {
            var user = snapshot.val();

            console.log('Room:\t user_added: ', user);
            $.publish('user_added.room', user);
        });

        self._usersRef.on('child_removed', function (snapshot) {
            var user = snapshot.val();

            console.log('Room:\t user_removed: ', user);
            $.publish('user_removed.room', user);
        });

        self._usersRef.on('child_changed', function (snapshot) {
            var user = snapshot.val();

            console.log('Room:\t user_changed: ', user);
            $.publish('user_changed.room', user);
        });

        console.log('Room:\t Connecting to: ', self.name);
    });

    return this;
};

ShareDrop.Room.prototype.update = function (attrs) {
    this._userRef.update(attrs);
};
