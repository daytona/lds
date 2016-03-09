var handlebars = require('handlebars');

function objectDeepMap(object, callback) {
  Object.keys(object).map((key) => {
    object[key] = callback(object[key], key);

    if (typeof object[key] === 'object') {
      objectDeepMap(object[key], callback);
    }
  })
  return object;
}

module.exports = function ldsHandlebars(options) {
  if (options.helpers) {
    // Loop through helpers and register on handlebars
    Object.keys(options.helpers).forEach((name) => {
      handlebars.registerHelper(name, options.helpers[name]);
    });
  }

  return function(namespace, prefix) {
    return function *(next) {
      var structure = this[namespace];
      // Iterate LDS-structure to register all partials as partials like component:mycomponent
      objectDeepMap(structure, (value) => {
        if (value && value.template) {
          handlebars.registerPartial(`${prefix ? prefix + '-' : ''}${value.category}:${value.name}`, value.template);

          var dependencies = value.template.match(/{{#?> ?([^ }]*) ?}}/g);

          if (dependencies) {
            dependencies = dependencies.map((str) => {
              return str.replace(/\{\{#?> ?([^@ }]*) ?\}\}/, (full, s1) => {
                return s1;
              });
            }).filter((partial) => {
              // ...but remove all instances of dependencies to inline partials
              return !value.template.match(new RegExp('{{#\*inline [\'\"](' + partial + ')[\'\"] ?}}', 'g'));
            });

            // set dependencies on object
            value.dependencies = {hbs : dependencies};
          }
        }
        return value;
      });

      // Then iterate again to cpmpile and return HTML of all example files,
      // allowing for styleguide on separate engine to render them
      objectDeepMap(structure, (value) => {
        if (value && value.example) {
          value.example = handlebars.compile(value.example)(value);
        }
        return value;
      });

      var api = Object.assign(options, {
        registerPartial: handlebars.registerPartial,
        registerHelper: handlebars.registerHelper,

        render(str, data) {
          return handlebars.compile(str)(data);
        },

        renderView(name, data) {
          var lds = structure;

          var view = lds.views[name];

          if (!view) {
            view = lds.views['404'] || {template: '404 Page Not found', data: {}};
          }
          var defaultData = this.defaultData || {};
          var viewData = Object.assign({layout: 'default'}, view.data, data);
          var layout = lds.layouts[viewData.layout];
          var layoutData = layout && layout.data || {};
          var pageData = Object.assign(defaultData, layoutData, viewData);
          var template = layout ? layout.template.replace(/{{{@body}}}/, view.template) : view.template;

          this.body = this.render(template, pageData);
        }
      });

      this.renderView = api.renderView;
      this.render = api.render;

      yield next;
    };
  };
}
