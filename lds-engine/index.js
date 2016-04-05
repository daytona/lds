var objectDeepMap = require('./lib/object-deep-map');

module.exports = function Engine(options) {
  if (options.helpers) {
    // Loop through helpers and register on templating engine
    Object.keys(options.helpers).forEach((name) => {
      options.registerHelper(name, options.helpers[name]);
    });
  }

  return {
    setup : function(namespace) {
      return function *(next) {
        var structure = this[namespace].structure;
        // Iterate LDS-structure to register all partials as partials like component:mycomponent
        objectDeepMap(structure, (value) => {
          // Register default template
          if (value && value.template) {
            options.registerPartial(`${value.category}:${value.name}`, value.template);
          }
          // Loop through all template files and register as child path e.g. {{> component:mycomponent/child }}
          if (value && value.templates) {
            value.templates.forEach((template) => {
              options.registerPartial(`${value.category}:${value.name}/${template.name}`, template.content);
            });
          }

            // var dependencies = value.template.match(/{{#?> ?([^ }]*) ?}}/g);
            //
            // if (dependencies) {
            //   dependencies = dependencies.map((str) => {
            //     return str.replace(/\{\{#?> ?([^@ }]*) ?\}\}/, (full, s1) => {
            //       return s1;
            //     });
            //   }).filter((partial) => {
            //     // ...but remove all instances of dependencies to inline partials
            //     return !value.template.match(new RegExp('{{#\*inline [\'\"](' + partial + ')[\'\"] ?}}', 'g'));
            //   });
            //
            //   // set dependencies on object
            //   value.dependencies = {hbs : dependencies};
            // }
          return value;
        });

        var api = Object.assign(options, {
          renderView(name, data, asReturn) {
            var view = structure.views[name];
            if (!view) {
              view = structure.views['404'] || {template: '404 Page Not found', data: {}};
            }
            var defaultData = this.defaultData || {};
            var viewData = Object.assign({layout: 'default'}, view.data, data);
            var layout = viewData.layout ? structure.layouts[viewData.layout] : false;
            var layoutData = layout && layout.data || {};
            var pageData = Object.assign(defaultData, layoutData, viewData);
            var template = layout ? layout.template.replace(/{{{@body}}}/, view.template) : view.template;

            if (asReturn) {
              return this.render(template, pageData);
            }
            this.type = 'text/html; charset=utf-8';
            this.body = this.render(template, pageData);
          }
        });

        this.render = options.render;
        this.renderView = api.renderView;

        yield next;
      };
    }
  };
}
