module.exports = function (grunt) {
    grunt.registerMultiTask('server', 'Start ShareDrop server', function (target) {
        var done = this.async(),
            options, keepalive, server;

        // Merge default options
        options = this.options({
            dir: 'app',
            base: ['.'],
            keepalive: false
        });

        keepalive = this.flags.keepalive || options.keepalive;
        server = require('../' + options.dir + '/server').server({base: options.base});

        server.listen(process.env.PORT)
        .on('listening', function () {
            grunt.log.writeln('Started ShareDrop web server...');

            if (!keepalive) {
                done();
            }
        });
    });
};
