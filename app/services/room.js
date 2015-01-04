import Ember from 'ember';

// TODO: use Ember.Object.extend()
var Room = function (name, firebaseRef) {
    this._ref = firebaseRef;
    this.name = name;
};

Room.prototype.join = function (user) {
    var self = this;

    // Setup Firebase refs
    self._connectionRef = self._ref.child('.info/connected');
    self._roomRef = self._ref.child('rooms/' + this.name);
    self._usersRef = self._roomRef.child('users');
    self._userRef = self._usersRef.child(user.uuid);

    console.log('Room:\t Connecting to: ', this.name);

    self._connectionRef.on('value', function (snapshot) {
        // Once connected (or reconnected) to Firebase
        if (snapshot.val() === true) {
            console.log('Firebase: (Re)Connected');

            // Remove yourself from the room when disconnected
            self._userRef.onDisconnect().remove();

            // Join the room
            self._userRef.set(user, function (error) {
                if (error) {
                    console.warn('Firebase: Adding user to the room failed: ', error);
                } else {
                    console.log('Firebase: User added to the room');
                    // Create a copy of user data,
                    // so that deleting properties won't affect the original variable
                    Ember.$.publish('connected.room', Ember.$.extend(true, {}, user));
                }
            });

            self._usersRef.on('child_added', function (snapshot) {
                var user = snapshot.val();

                console.log('Room:\t user_added: ', user);
                Ember.$.publish('user_added.room', user);
            });

            self._usersRef.on('child_removed', function (snapshot) {
                var user = snapshot.val();

                console.log('Room:\t user_removed: ', user);
                Ember.$.publish('user_removed.room', user);
            }, function () {
                // Handle case when the whole room is removed from Firebase
                Ember.$.publish('disconnected.room');
            });

            self._usersRef.on('child_changed', function (snapshot) {
                var user = snapshot.val();

                console.log('Room:\t user_changed: ', user);
                Ember.$.publish('user_changed.room', user);
            });
        } else {
            console.log('Firebase: Disconnected');

            Ember.$.publish('disconnected.room');
            self._usersRef.off();
        }
    });

    return this;
};

Room.prototype.update = function (attrs) {
    this._userRef.update(attrs);
};

Room.prototype.leave = function () {
    this._userRef.remove();
    this._usersRef.off();
};

export default Room;
