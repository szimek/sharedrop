import EmberObject, { observer } from '@ember/object';
import Evented, { on } from '@ember/object/evented';

export default EmberObject.extend(Evented, {
  uuid: null,
  label: null,
  avatarUrl: null,
  public_ip: null,
  peer: null,
  transfer: null,

  init(...args) {
    this._super(args);

    const initialPeerState = EmberObject.create({
      id: null,
      connection: null,
      // State of data channel connection. Possible states:
      // - disconnected
      // - connecting
      // - connected
      state: 'disconnected',
    });
    const initialTransferState = EmberObject.create({
      file: null,
      info: null,
      sendingProgress: 0,
      receivingProgress: 0,
    });

    this.set('peer', initialPeerState);
    this.set('transfer', initialTransferState);
  },

  // Used to display popovers. Possible states:
  // - idle
  // - has_selected_file
  // - establishing_connection
  // - awaiting_response
  // - received_file_info
  // - declined_file_transfer
  // - receiving_file_data
  // - sending_file_data
  // - error
  state: 'idle',

  // Used to display error messages in popovers. Possible codes:
  // - multiple_files
  errorCode: null,

  stateChanged: on(
    'init',
    observer('state', function() {
      console.log('Peer:\t State has changed: ', this.get('state'));

      // Automatically clear error code if transitioning to a non-error state
      if (this.get('state') !== 'error') {
        this.set('errorCode', null);
      }
    })
  ),
});
