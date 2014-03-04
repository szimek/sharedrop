window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
window.URL = window.URL || window.webkitURL;

FileDrop.File = function (options) {
    var self = this;

    this.name = options.name;
    this.size = options.size;
    this.type = options.type;

    this._reset();

    return new Promise(function (resolve, reject) {
        window.requestFileSystem(
            window.TEMPORARY,
            options.size,
            function (filesystem) {
                self.filesystem = filesystem;
                resolve(self);
            },
            function (error) {
                this.errorHandler(error);
                reject(error);
            }
        );
    });
};

FileDrop.File.prototype.append = function (data) {
    var self = this,
        options = {
            create: this.create
        };

    return new Promise(function (resolve, reject) {
        self.filesystem.root.getFile(self.name, options, function (fileEntry) {
            if (self.create) {
                self.fileEntry = fileEntry;
                self.create = false;
            }

            fileEntry.createWriter(function (writer) {
                var blob = new Blob(data, {type: self.type});

                // console.log('File: Appending ' + blob.size + ' bytes at ' + self.seek);

                writer.onwriteend = function () {
                    self.seek += blob.size;
                    resolve(fileEntry);
                };

                writer.onerror = function (error) {
                    this.errorHandler(error);
                    reject(error);
                };

                writer.seek(self.seek);
                writer.write(blob);
            }, function (error) {
                this.errorHandler(error);
                reject(error);
            });
        }, function (error) {
            this.errorHandler(error);
            reject(error);
        });
    });
};

FileDrop.File.prototype.save = function () {
    console.log('File: Saving file: ', this.fileEntry);

    var a = document.createElement('a');
    a.download = this.name;
    a.href = this.fileEntry.toURL(); // TODO: Add Firefox version as well
    document.body.appendChild(a);
    a.click();

    // TODO: figure out how to remove file once it's completely saved
    // Remove file entry from filesystem
    // this.remove().then(this._reset);
};

FileDrop.File.prototype.errorHandler = function (error) {
    var msg;

    switch (error.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
    case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
    case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
    case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
    case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
    default:
        msg = 'Unknown Error';
        break;
    }

    console.error('File error: ' + msg);
};

FileDrop.File.prototype.remove = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
        self.filesystem.root.getFile(self.name, {create: false}, function (fileEntry) {
            fileEntry.remove(function () {
                console.debug('File: Removed file: ' + self.name);
                resolve(fileEntry);
            }, function (error) {
                this.errorHandler(error);
                reject(error);
            });
        }, function (error) {
           this.errorHandler(error);
           reject(error);
        });
    });
};

FileDrop.File.prototype._reset = function () {
    this.create = true;
    this.filesystem = null;
    this.fileEntry = null;
    this.seek = 0;
};

