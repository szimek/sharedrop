FileDrop.App.User = FileDrop.App.Peer.extend({
    room: null,

    serialize: function () {
        return {
            uuid: this.get('uuid'),
            email: this.get('email'),
            public_ip: this.get('public_ip'),
            local_ip: this.get('local_ip'),
            peer: {
                id: this.get('peer.id')
            }
        };
    },

    // Make user's email available after page reload,
    // by storing it in local storage.
    userEmailDidChange: function () {
        var email = this.get('email');

        if (email) {
            localStorage.email = email;
        } else {
            localStorage.removeItem('email');
        }
    }.observes('email')
});
