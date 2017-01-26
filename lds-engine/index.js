var objectDeepMap = require('./lib/object-deep-map');

function obj2json (obj) {
  return JSON.stringify(obj).replace(new RegExp('\"', 'g'), "&quot\;");
}
function json2obj (json) {
  return typeof json === 'String' ? JSON.parse(json.replace(/\&quot\;/g, '\"')) : json;
}

module.exports = function Engine(options) {
  options.registerHelper('jsonLine', function(obj){
    return typeof obj === 'object' ? JSON.stringify(obj).replace(new RegExp('\"', 'g'), '\\"') : obj;
  });


  if (options.helpers) {
    // Loop through helpers and register on templating engine
    Object.keys(options.helpers).forEach((name) => {
      options.registerHelper(name, options.helpers[name]);
    });
  }

  return {
    setup : function(namespace) {
      return function *(next) {
        if (this.editmode) {
          var usedPartials = [];
          options.registerHelper('getLDSPartials', () => {
            return usedPartials;
          });

          options.registerHelper('saveLDSPartial', (partialName, datapath, data, schema) => {
            usedPartials.push({
              partialName,
              datapath: data.$objectPath,
              data,
              schema: json2obj(schema)
            });
          });
        }

        var structure = this[namespace].structure;
        var editmode = this.editmode;
        // Iterate LDS-structure to register all partials as partials like component:mycomponent
        objectDeepMap(structure, (value) => {
          if (value && value.isLDSObject) {
            // Register default template
            if (value.template) {
              if (editmode && value.config && value.config.schema) {
                value.template = `<!-- component="${value.partialName}" datapath="{{$objectPath}}" data="{{jsonLine this}}" schema="{}"-->{{saveLDSPartial '${value.partialName}' this '${obj2json(value.config.schema)}' }}${value.template}<!-- /${value.partialName} -->`;
              }
              options.registerPartial(value.partialName, value.template);

            }
            // Loop through all template files and register as child path e.g. {{> component:mycomponent/child }}
            if (value.templates && value.templates.length) {
              value.templates.forEach((template) => {
                options.registerPartial(`${value.partialName}/${template.name}`, template.content);
              });
            }
          }

          return value;
        });

        var api = Object.assign(options, {
          renderView(view, data, asReturn) {
            if (!view) {
              view = structure.views['404'] || {template: '404 Page Not found', data: {}};
            }
            var defaultData = this.defaultData || {};
            var viewData = Object.assign({layout: 'default'}, view.data, data);
            if (this.editmode) {
              objectDeepMap(viewData, (value, key, path) => {
                // Is value an object
                if (value === Object(value)) {
                  value.$objectPath = path.length ? path + '.' + key : key;
                }
                return value;
              });
            }

            var layout = viewData.layout ? structure.layouts[viewData.layout] : false;
            var layoutData = layout && layout.data || {};
            var pageData = Object.assign(defaultData, layoutData, viewData);
            var viewTemplate = view.template;

            if (this.editmode) {
              viewTemplate = viewTemplate + `<script>window.PageData = JSON.parse("{{jsonLine (getLDSPartials)}}".replace(/\&quot;/g, '"'));</script>`;
            }
            var template = layout ? layout.template.replace(/{{{@body}}}/, viewTemplate) : viewTemplate;

            var html = this.render(template, pageData);

            if (asReturn) {
              return html;
            }
            this.type = 'text/html; charset=utf-8';
            this.body = html;
          }
        });

        this.render = options.render;
        this.renderView = api.renderView;

        yield next;
      };
    }
  };
}
