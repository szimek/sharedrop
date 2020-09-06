import TextField from '@ember/component/text-field';
import $ from 'jquery';
import JSZip from 'jszip';

export default TextField.extend({
  type: 'file',
  classNames: ['invisible'],

  click(event) {
    event.stopPropagation();
  },

  change(event) {
    const input = event.target;
    const { files } = input;

    if (files.length > 1) {
      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.name, file);
      });

      zip.generateAsync({ type: 'blob' }).then(function (blob) {
        this.onChange({
          file: new File([blob], 'sharedrop.zip', {
            type: 'application/zip',
          }),
        });
      });
    } else {
      this.onchange({ file: files[0] });
    }
    this.reset();
  },

  // Hackish way to reset file input when sender cancels file transfer,
  // so if sender wants later to send the same file again,
  // the 'change' event is triggered correctly.
  reset() {
    const field = $(this.element);
    field.wrap('<form>').closest('form').get(0).reset();
    field.unwrap();
  },
});
