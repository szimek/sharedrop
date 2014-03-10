window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
window.URL = window.URL || window.webkitURL;

ShareDrop.File = function (options) {
    var self = this;

    this.name = options.name;
    this.localName = new Date().getTime() + '-' + this.name;
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
                self.errorHandler(error);
                reject(error);
            }
        );
    });
};

ShareDrop.File.removeAll = function () {
    return new Promise(function (resolve, reject) {
        var filer = new Filer();

        filer.init({persistent: false}, function () {
            filer.ls('/', function (entries) {
                function rm(entry) {
                    if (entry) {
                        filer.rm(entry, function () {
                            rm(entries.pop());
                        });
                    } else {
                        resolve();
                    }
                }

                rm(entries.pop());
            });
        }, function (error) {
            console.log(error);
            reject(error);
        });
    });
};

ShareDrop.File.prototype.append = function (data) {
    var self = this,
        options = {
            create: this.create
        };

    return new Promise(function (resolve, reject) {
        self.filesystem.root.getFile(self.localName, options, function (fileEntry) {
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
                    self.errorHandler(error);
                    reject(error);
                };

                writer.seek(self.seek);
                writer.write(blob);
            }, function (error) {
                self.errorHandler(error);
                reject(error);
            });
        }, function (error) {
            self.errorHandler(error);
            reject(error);
        });
    });
};

ShareDrop.File.prototype.save = function () {
    var self = this;

    console.log('File: Saving file: ', this.fileEntry);

    var a = document.createElement('a');
    a.download = this.name;

    if (this._isWebKit()) {
        a.href = this.fileEntry.toURL();
        finish(a);
    } else {
        this.fileEntry.file(function (file) {
            a.href = window.URL.createObjectURL(file);
            finish(a);
        });
    }

    function finish(a) {
        document.body.appendChild(a);
        a.addEventListener('click', function () {
            // Remove file entry from filesystem.
            setTimeout(function () {
                self.remove().then(self._reset);
            }, 100); // Hack, but otherwise browser doesn't save the file at all.

            a.parentNode.removeChild(a);
        });
        a.click();
    }
};

ShareDrop.File.prototype.errorHandler = function (error) {
    console.error('File error: ', error);
};

ShareDrop.File.prototype.remove = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
        self.filesystem.root.getFile(self.localName, {create: false}, function (fileEntry) {
            fileEntry.remove(function () {
                console.debug('File: Removed file: ' + self.localName);
                resolve(fileEntry);
            }, function (error) {
                self.errorHandler(error);
                reject(error);
            });
        }, function (error) {
           self.errorHandler(error);
           reject(error);
        });
    });
};

ShareDrop.File.prototype._reset = function () {
    this.create = true;
    this.filesystem = null;
    this.fileEntry = null;
    this.seek = 0;
};

ShareDrop.File.prototype._isWebKit = function () {
    return !!window.webkitRequestFileSystem;
};

