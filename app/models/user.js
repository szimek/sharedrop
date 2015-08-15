import Ember from "ember";
import Peer from "./peer";

export default Peer.extend({
    init() {
        this.set("local_ips", []);
        this._super();
    },

    local_ip: Ember.computed("local_ips.[]", {
        get: function () {
            const ips = this.get("local_ips");
            const storedIp = localStorage.getItem("local_ip");

            if (storedIp && ips.contains(storedIp)) {
                return storedIp;
            } else {
                return ips[0] || null;
            }
        },

        set: function (key, value) {
            const ips = this.get("local_ips");

            if (value && ips.contains(value)) {
                localStorage.setItem("local_ip", value);
            }

            return value;
        }
    }),

    label: function () {
        var email = this.get("email"),
            local_ip = this.get("local_ip"),
            label;

        if (email && local_ip) {
            label = email + " (" + local_ip + ")";
        } else if (local_ip) {
            label = local_ip;
        } else if (email) {
            label = email;
        } else {
            label = null;
        }

        return label;
    }.property("email", "local_ip"),

    labelWithPublicIp: function () {
        var email = this.get("email"),
            public_ip = this.get("public_ip"),
            local_ip = this.get("local_ip"),
            label;

        if (email && local_ip) {
            label = email + " (" + public_ip + "/" + local_ip + ")";
        } else if (local_ip) {
            label = public_ip + "/" + local_ip;
        } else if (email) {
            label = email + " (" + public_ip + ")";
        } else {
            label = null;
        }

        return label;
    }.property("email", "public_ip", "local_ip"),

    serialize: function () {
        var data = {
            uuid: this.get("uuid"),
            email: this.get("email"),
            public_ip: this.get("public_ip"),
            peer: {
                id: this.get("peer.id")
            }
        }, local_ip;

        if ((local_ip = this.get("local_ip"))) {
            data.local_ip = local_ip;
        }

        return data;
    },

    // Make user"s email available after page reload,
    // by storing it in local storage.
    userEmailDidChange: function () {
        var email = this.get("email");

        if (email) {
            localStorage.email = email;
        } else {
            localStorage.removeItem("email");
        }
    }.observes("email")
});
