(function () {
    var Room = FileDrop.Room,
        Peer = FileDrop.Peer,
        App  = Ember.Application.create();

    App.Peer = Ember.Object.extend({
        uuid: null,
        email: null,
        public_ip: null,

        peer: Ember.Object.create({
            id: null,
            connection: null,
            file: null,
        }),

        isConnected: function () {
            return !!this.get('peer.connection');
        }.property('peer.connection'),

        label: function () {
            return this.get('email') || this.get('uuid');
        }.property('uuid', 'email'),

        avatarUrl: function () {
            var email = this.get('email'),
                path;

            path = email ? this.MD5(email.trim().toLowerCase()) + '.jpg?s=64' : '?d=mm';
            return 'http://www.gravatar.com/avatar/' + path;
        }.property('email'),

        serialize: function () {
            return {
                uuid: this.get('uuid'),
                email: this.get('email'),
                peer: {
                    id: this.get('peer.id')
                }
            };
        },

        MD5: function (s) {
            function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()
        }
    });

    App.ApplicationController = Ember.Controller.extend({
        init: function () {
            this._super();

            var user = App.Peer.create({
                email: localStorage.email || null,
                label: 'You'
            });
            this.set('user', user);

            this.handlePersonaAuth();
        },

        actions: {
            signIn: function () {
                navigator.id.request();
            },

            signOut: function () {
                navigator.id.logout();
            }
        },

        handlePersonaAuth: function () {
            var self = this;

            navigator.id.watch({
                loggedInUser: this.get('user.email'),

                onlogin: function (assertion) {
                    $.ajax({
                        type: 'POST',
                        url: '/persona/verify',
                        data: {assertion: assertion},
                        success: function (res, status, xhr) {
                            console.log('Persona: Signed in as: "' + res.email + '"');

                            if (res && res.status === "okay") {
                                self.set('user.email', res.email);
                            }
                        },
                        error: function (xhr, status, err) {
                            console.log('Persona: Signed in error: ', err);
                            navigator.id.logout();
                        }
                    });
                },

                onlogout: function () {
                    $.ajax({
                        type: 'POST',
                        url: '/persona/logout',
                        success: function(res, status, xhr) {
                            console.log('Persona: Signed out');
                            self.set('user.email', null);
                        },
                        error: function(xhr, status, err) {
                            console.log('Persona: Sign out error: ', err);
                        }
                    });
                }
            });
        },

        // Store user's email in localStorage
        userEmailHasChanged: function () {
            var email = this.get('user.email');

            if (email) {
                localStorage.email = email;
            } else {
                localStorage.removeItem('email');
            }
        }.observes('user.email'),
    });

    App.IndexController = Ember.ArrayController.extend({
        needs: ['application'],

        user: Ember.computed.alias('controllers.application.user'),
        room: null,

        init: function () {
            // Connect to PeerJS server first,
            // so that we already have peer ID when later joining a room.
            this.set('_peer', new FileDrop.Peer());

            // Handle room events
            $.subscribe('connected.room', this._onRoomConnected.bind(this));
            $.subscribe('user_list.room', this._onRoomUserList.bind(this));
            $.subscribe('user_added.room', this._onRoomUserAdded.bind(this));
            $.subscribe('user_changed.room', this._onRoomUserChanged.bind(this));
            $.subscribe('user_removed.room', this._onRoomUserRemoved.bind(this));

            // Handle peer events
            $.subscribe('connected.server.peer', this._onPeerServerConnected.bind(this));
            $.subscribe('connected.p2p.peer', this._onPeerP2PConnected.bind(this));
            $.subscribe('disconnected.p2p.peer', this._onPeerP2PDisconnected.bind(this));
            $.subscribe('info.p2p.peer', this._onPeerP2PFileInfo.bind(this));
            $.subscribe('response.p2p.peer', this._onPeerP2PFileResponse.bind(this));
            $.subscribe('file.p2p.peer', this._onPeerP2PFileTransfer.bind(this));

            this._super();
        },

        _onRoomConnected: function (event, data) {
            var user = this.get('user');

            data.label = 'You (' + data.uuid + ')';
            user.setProperties(data);
        },

        _onRoomUserList: function (event, data) {
            // Add all peers to the list and
            // initiate p2p connection to every one of them.
            var _peer = this.get('_peer');

            data.forEach(function (attrs) {
                var peer = App.Peer.create(attrs);

                this.pushObject(peer);
                _peer.connect(peer.get('peer.id'));
            }.bind(this));
        },

        _onRoomUserAdded: function (event, data) {
            var user = this.get('user'),
                peer;

            if (user.get('uuid') !== data.uuid) {
                // Add peer to the list of peers in the room
                peer = App.Peer.create(data);
                this.pushObject(peer);
            }
        },

        _onRoomUserChanged: function (event, data) {
            var peer = this.findBy('uuid', data.uuid);
            if (peer) peer.setProperties(data);
        },

        _onRoomUserRemoved: function (event, data) {
            var peer = this.findBy('uuid', data.uuid);
            this.removeObject(peer);
        },

        _onPeerServerConnected: function (event, data) {
            var user = this.get('user');

            user.setProperties({isConnected: true});
            user.get('peer').setProperties({id: data.id});

            // Join room and broadcast user attributes
            var room = new FileDrop.Room();
            room.join(user.serialize());
            this.set('room', room);
        },

        _onPeerP2PConnected: function (event, data) {
            var connection = data.connection,
                peer = this.findBy('peer.id', connection.peer);

            peer.set('peer.connection', connection);
        },

        _onPeerP2PDisconnected: function (event, data) {
            var connection = data.connection,
                peer = this.findBy('peer.d', connection.peer);

            if (peer) peer.set('peer.connection', null);
        },

        _onPeerP2PFileInfo: function (event, data) {
            console.log('Peer:\t Received file info', data);

            var _peer = this.get('_peer'),
                connection = data.connection,
                peer = this.findBy('peer.id', connection.peer),
                info = data.info,
                response;

            response = window.confirm('"' + peer.uuid + '"' + ' wants to send you "' + info.name + '".');
            _peer.sendFileResponse(connection, response);
        },

        _onPeerP2PFileResponse: function (event, data) {
            console.log('Peer:\t Received file response', data);

            var _peer = this.get('_peer'),
                connection = data.connection,
                peer = this.findBy('peer.id', connection.peer),
                response = data.response,
                file;

            if (response) {
                file = peer.get('peer.file');
                _peer.sendFile(connection, file);
            }

            // Remove "cached" file for that peer now that we have a response
            peer.set('peer.file', null);
        },

        _onPeerP2PFileTransfer: function (event, data) {
            console.log('Peer:\t Received file', data);

            var file = data.file,
                dataView, dataBlob, dataUrl;

            if (file.data.constructor === ArrayBuffer) {
                dataView = new Uint8Array(file.data);
                dataBlob = new Blob([dataView]);
                dataUrl = window.URL.createObjectURL(dataBlob);

                // Save received file
                var a = document.createElement('a');
                a.setAttribute('download', file.name);
                a.setAttribute('href', dataUrl);
                document.body.appendChild(a);
                a.click();
            }
        },

        // Broadcast user's email changes to other peers
        userEmailHasChanged: function () {
            var email = this.get('user.email'),
                room  = this.get('room');

            if (room) room.update({email: email});
        }.observes('user.email')
    });

    App.PeerController = Ember.ObjectController.extend({
        needs: 'index',

        _peer: Ember.computed.alias('controllers.index._peer'),
        fileToSend: null,
        fileToReceive: null
    });

    App.IndexView = Ember.View.extend({
        classNames: ['container']
    });

    App.PeerView = Ember.View.extend({
        isConnected: Ember.computed.alias('controller.model.isConnected'),
        classNames: ['media', 'peer'],
        classNameBindings: ['isConnected:connected:disconnected'],

        // Handle drop events
        dragEnter: function (event) {
            this.cancelEvent(event);
        },

        dragOver: function (event) {
            this.cancelEvent(event);
        },

        drop: function (event) {
            this.cancelEvent(event);

            var _peer = this.get('controller._peer'),
                peer = this.get('controller.model'),
                connection = peer.get('peer.connection'),
                dt = event.originalEvent.dataTransfer,
                files = dt.files,
                file = files[0];

            console.log('Sending a file...');

            // Store file, so it's available when a response from the recipient comes in.
            peer.set('peer.file', file);

            var response = window.confirm('Do you want to send "' + file.name + '" to "' + peer.get('label') + '"?');
            if (response) {
                _peer.sendFileInfo(connection, file);
            }
        },

        cancelEvent: function (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    });

    App.ConfirmPopoverComponent = Ember.Component.extend({
        didInsertElement: function () {
            this._super();

            var html = this.$().html();

            this.$().popover({
                html: true,
                content: html,
                placement: 'top'
            });
            this.$().html("");
        },

        show: function () {
          this.$().popover('show');
        },

        hide: function () {
          this.$().popover('hide');
        },

        actions: {
            confirm: function () {
                console.log('confirm');
                this.set('isVisible', false);
                // this.sendAction();
            },

            cancel: function() {
                console.log('cancel');
                this.set('isVisible', false);
                // this.sendAction();
            }
        }
    });

    FileDrop.App = App;
})();
