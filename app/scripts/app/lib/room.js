ShareDrop.Room = function () {
    var url = window.location.protocol + '//' + window.location.hostname;
    this._socket = new io.connect(url);
    this.name = null;
};

ShareDrop.Room.prototype.join = function (user) {
    var self = this;

    // Get room name
    $.getJSON('/room')

    // Join room and listen for changes
    .then(function (data) {
        var socket = self._socket;

        self.name = data.name,

        $.extend(user, {
            uuid: data.uuid,
            public_ip: data.public_ip
        });

        socket.emit('join', {
            room: self.name,
            peer: user
        });
        console.log('Room:\t Connecting to: ', self.name);

        socket.on('user_list', function (data) {
            console.log('Room:\t Connected to: ', self.name);
            $.publish('connected.room', user);

            console.log('Room:\t user_list: ', data);
            $.publish('user_list.room', [data]);
        });

        socket.on('user_added', function (user) {
            console.log('Room:\t user_added: ', user);
            $.publish('user_added.room', user);
        });

        socket.on('user_changed', function (user) {
            console.log('Room:\t user_changed: ', user);
            $.publish('user_changed.room', user);
        });

        socket.on('user_removed', function (user) {
            console.log('Room:\t user_removed: ', user);
            $.publish('user_removed.room', user);
        });

        socket.on('disconnect', function () {
            console.log('Room:\t disconnect');
        });

        socket.on('error', function () {
            console.log('Room:\t error');
        });

        socket.on('reconnecting', function () {
            console.log('Room:\t reconnecting');
        });

        socket.on('reconnect', function () {
            console.log('Room:\t reconnect');
        });
    });

    return this;
};

ShareDrop.Room.prototype.update = function (attrs) {
    this._socket.emit('update', {
        room: this.name,
        peer: attrs
    });
};
