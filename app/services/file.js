import { Promise } from 'rsvp';

const File = function(options) {
  const self = this;

  this.name = options.name;
  this.localName = `${new Date().getTime()}-${this.name}`;
  this.size = options.size;
  this.type = options.type;

  this._reset();

  return new Promise((resolve, reject) => {
    const requestFileSystem =
      window.requestFileSystem || window.webkitRequestFileSystem;

    requestFileSystem(
      window.TEMPORARY,
      options.size,
      (filesystem) => {
        self.filesystem = filesystem;
        resolve(self);
      },
      (error) => {
        self.errorHandler(error);
        reject(error);
      }
    );
  });
};

File.removeAll = function() {
  return new Promise((resolve, reject) => {
    const filer = new window.Filer();

    filer.init(
      { persistent: false },
      () => {
        filer.ls('/', (entries) => {
          function rm(entry) {
            if (entry) {
              filer.rm(entry, () => {
                rm(entries.pop());
              });
            } else {
              resolve();
            }
          }

          rm(entries.pop());
        });
      },
      (error) => {
        console.log(error);
        reject(error);
      }
    );
  });
};

File.prototype.append = function(data) {
  const self = this;
  const options = {
    create: this.create,
  };

  return new Promise((resolve, reject) => {
    self.filesystem.root.getFile(
      self.localName,
      options,
      (fileEntry) => {
        if (self.create) {
          self.create = false;
        }

        self.fileEntry = fileEntry;

        fileEntry.createWriter(
          (writer) => {
            const blob = new Blob(data, { type: self.type });

            // console.log('File: Appending ' + blob.size + ' bytes at ' + self.seek);

            // eslint-disable-next-line no-param-reassign
            writer.onwriteend = function() {
              self.seek += blob.size;
              resolve(fileEntry);
            };

            // eslint-disable-next-line no-param-reassign
            writer.onerror = function(error) {
              self.errorHandler(error);
              reject(error);
            };

            writer.seek(self.seek);
            writer.write(blob);
          },
          (error) => {
            self.errorHandler(error);
            reject(error);
          }
        );
      },
      (error) => {
        self.errorHandler(error);
        reject(error);
      }
    );
  });
};

File.prototype.save = function() {
  const self = this;

  console.log('File: Saving file: ', this.fileEntry);

  const a = document.createElement('a');
  a.download = this.name;

  function finish(link) {
    document.body.appendChild(a);
    link.addEventListener('click', () => {
      // Remove file entry from filesystem.
      setTimeout(() => {
        self.remove().then(self._reset.bind(self));
      }, 100); // Hack, but otherwise browser doesn't save the file at all.

      link.parentNode.removeChild(a);
    });
    link.click();
  }

  if (this._isWebKit()) {
    a.href = this.fileEntry.toURL();
    finish(a);
  } else {
    this.fileEntry.file((file) => {
      const URL = window.URL || window.webkitURL;
      a.href = URL.createObjectURL(file);
      finish(a);
    });
  }
};

File.prototype.errorHandler = function(error) {
  console.error('File error: ', error);
};

File.prototype.remove = function() {
  const self = this;

  return new Promise((resolve, reject) => {
    self.filesystem.root.getFile(
      self.localName,
      { create: false },
      (fileEntry) => {
        fileEntry.remove(
          () => {
            console.debug(`File: Removed file: ${self.localName}`);
            resolve(fileEntry);
          },
          (error) => {
            self.errorHandler(error);
            reject(error);
          }
        );
      },
      (error) => {
        self.errorHandler(error);
        reject(error);
      }
    );
  });
};

File.prototype._reset = function() {
  this.create = true;
  this.filesystem = null;
  this.fileEntry = null;
  this.seek = 0;
};

File.prototype._isWebKit = function() {
  return !!window.webkitRequestFileSystem;
};

export default File;
