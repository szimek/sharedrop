import Route from '@ember/routing/route';

export default Route.extend({
  renderTemplate(controller, error) {
    const errors = ['browser-unsupported', 'filesystem-unavailable'];
    const name = `errors/${error.message}`;

    if (errors.indexOf(error.message) !== -1) {
      this.render(name);
    }
  },
});
