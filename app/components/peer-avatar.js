import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { later } from '@ember/runloop';
import $ from 'jquery';
import { Promise } from 'rsvp';

export default Component.extend({
  tagName: 'img',
  classNames: ['gravatar'],
  attributeBindings: [
    'src',
    'alt',
    'title',
    'data-sending-progress',
    'data-receiving-progress',
  ],
  src: alias('peer.avatarUrl'),
  alt: alias('peer.label'),
  title: alias('peer.uuid'),
  'data-sending-progress': alias('peer.transfer.sendingProgress'),
  'data-receiving-progress': alias('peer.transfer.receivingProgress'),

  toggleTransferCompletedClass() {
    const className = 'transfer-completed';

    later(
      this,
      function toggleClass() {
        this.$()
          .parent('.avatar')
          .addClass(className)
          .delay(2000)
          .queue(function removeClass() {
            $(this)
              .removeClass(className)
              .dequeue();
          });
      },
      250
    );
  },

  init(...args) {
    this._super(args);

    this.toggleTransferCompletedClass = this.toggleTransferCompletedClass.bind(
      this
    );
  },

  didInsertElement(...args) {
    this._super(args);
    const peer = this.get('peer');

    peer.on('didReceiveFile', this.toggleTransferCompletedClass);
    peer.on('didSendFile', this.toggleTransferCompletedClass);
  },

  willDestroyElement(...args) {
    this._super(args);
    const peer = this.get('peer');

    peer.off('didReceiveFile', this.toggleTransferCompletedClass);
    peer.off('didSendFile', this.toggleTransferCompletedClass);
  },

  // Delegate click to hidden file field in peer template
  click() {
    if (this.canSendFile()) {
      this.$()
        .closest('.peer')
        .find('input[type=file]')
        .click();
    }
  },

  // Handle drop events
  dragEnter(event) {
    this.cancelEvent(event);

    this.$()
      .parent('.avatar')
      .addClass('hover');
  },

  dragOver(event) {
    this.cancelEvent(event);
  },

  dragLeave() {
    this.$()
      .parent('.avatar')
      .removeClass('hover');
  },

  drop(event) {
    this.cancelEvent(event);
    this.$()
      .parent('.avatar')
      .removeClass('hover');

    const peer = this.get('peer');
    const dt = event.originalEvent.dataTransfer;
    const { files } = dt;
    const file = files[0];

    if (this.canSendFile()) {
      if (files.length > 1) {
        peer.setProperties({
          state: 'error',
          errorCode: 'multiple-files',
        });
      } else {
        this.isFile(file).then(() => {
          this.onFileDrop({ file });
        });
      }
    }
  },

  cancelEvent(event) {
    event.stopPropagation();
    event.preventDefault();
  },

  canSendFile() {
    const peer = this.get('peer');

    // Can't send files if another file transfer is already in progress
    return !(peer.get('transfer.file') || peer.get('transfer.info'));
  },

  isFile(file) {
    return new Promise((resolve, reject) => {
      if (file instanceof window.File) {
        if (file.size > 1048576) {
          // It's bigger than 1MB, so we assume it's a file
          resolve();
        } else {
          // Try to read it using FileReader - if it's not a file,
          // it should trigger onerror handler
          const reader = new FileReader();
          reader.onload = function() {
            resolve();
          };
          reader.onerror = function() {
            reject();
          };
          reader.readAsArrayBuffer(file);
        }
      } else {
        reject();
      }
    });
  },
});
