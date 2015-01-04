import Ember from 'ember';

export default Ember.Route.extend({
    renderTemplate: function(controller, error) {
        var name = 'errors/' + error.message,
            template = Ember.TEMPLATES[name];

        if (template) { this.render(name); }
    }
});
