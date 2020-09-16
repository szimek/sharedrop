import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { later } from '@ember/runloop';
import $ from 'jquery';

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
        $(this.element)
          .parent('.avatar')
          .addClass(className)
          .delay(2000)
          .queue(function removeClass() {
            $(this).removeClass(className).dequeue();
          });
      },
      250,
    );
  },

  init(...args) {
    this._super(args);

    this.toggleTransferCompletedClass = this.toggleTransferCompletedClass.bind(
      this,
    );
  },

  didInsertElement(...args) {
    this._super(args);
    const { peer } = this;

    peer.on('didReceiveFile', this.toggleTransferCompletedClass);
    peer.on('didSendFile', this.toggleTransferCompletedClass);
  },

  willDestroyElement(...args) {
    this._super(args);
    const { peer } = this;

    peer.off('didReceiveFile', this.toggleTransferCompletedClass);
    peer.off('didSendFile', this.toggleTransferCompletedClass);
  },

  // Delegate click to hidden file field in peer template
  click() {
    if (this.canSendFile()) {
      $(this.element).closest('.peer').find('input[type=file]').click();
    }
  },

  // Handle drop events
  dragEnter(event) {
    this.cancelEvent(event);

    $(this.element).parent('.avatar').addClass('hover');
  },

  dragOver(event) {
    this.cancelEvent(event);
  },

  dragLeave() {
    $(this.element).parent('.avatar').removeClass('hover');
  },

  drop(event) {
    this.cancelEvent(event);
    $(this.element).parent('.avatar').removeClass('hover');

    const { peer } = this;
    const dt = event.originalEvent.dataTransfer;
    const { files } = dt;

    if (this.canSendFile()) {
      if (!this.isTransferableBundle(files)) {
        peer.setProperties({
          state: 'error',
          errorCode: 'multiple-files',
        });
      } else {
        this.onFileDrop({ files });
      }
    }
  },

  cancelEvent(event) {
    event.stopPropagation();
    event.preventDefault();
  },

  canSendFile() {
    const { peer } = this;

    // Can't send files if another file transfer is already in progress
    return !(
      peer.get('state') === 'is_preparing_file_transfer' ||
      peer.get('transfer.file') ||
      peer.get('transfer.info')
    );
  },

  isTransferableBundle(files) {
    if (files.length === 1 && files[0] instanceof window.File) return true;

    const fileSizeLimit = 50 * 1024 * 1024;
    const bundleSizeLimit = 200 * 1024 * 1024;
    let aggregatedSize = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      if (!(file instanceof window.File)) {
        return false;
      }
      if (file.size > fileSizeLimit) {
        return false;
      }
      aggregatedSize += file.size;
      if (aggregatedSize > bundleSizeLimit) {
        return false;
      }
    }
    return true;
  },
});
