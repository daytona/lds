var objectDeepMap = require('./lib/object-deep-map');
var guid = require('./lib/guid');

function obj2json (obj) {
  return typeof obj === 'object' ? JSON.stringify(obj).replace(new RegExp('\"', 'g'), "&quot\;") : obj;
}
function json2obj (json) {
  return typeof json === 'String' ? JSON.parse(json.replace(/\&quot\;/g, '\"')) : json;
}

module.exports = function Engine(options) {
  options.registerHelper('jsonLine', function(obj){
    return typeof obj === 'object' ? JSON.stringify(obj).replace(new RegExp('\"', 'g'), '\\"') : obj;
  });

  options.registerHelper('__resetLDSPartials', function(options) {
    options.data.usedPartials = [];
  });

  options.registerHelper('__getLDSPartials', function(options) {
    return options.data.usedPartials;
  });

  options.registerHelper('__LDSPartialStart', function(partialName, data, schema, options) {
    if (options.data.root.editmode) {
      if (!options.data.usedPartials) {
        options.data.usedPartials = [];
      }
      options.data.usedPartials.push({
        partialName,
        datapath: data.__objectPath,
        data,
        schema: json2obj(schema)
      });
      // The exakt format of this comment is required by lds-editor
      return `<!-- component="${partialName}" id="partial-${guid()}" data="${obj2json(data)}" -->`;
    }
  });

  options.registerHelper('__LDSPartialEnd', function(partialName, options) {
    if (options.data.root.editmode) {
      // The exakt format of this comment is required by lds-editor
      return `<!-- /${partialName} -->`;
    }
  });

  options.registerHelper('__LDSEditScript', function(options) {
    if (options.data.root.editmode) {
      // The exakt format of this comment is required by lds-editor
      return `<script src="/api/editscript"></script>`;
    }
  });



  if (options.helpers) {
    // Loop through helpers and register on templating engine
    Object.keys(options.helpers).forEach((name) => {
      options.registerHelper(name, options.helpers[name]);
    });
  }

  return {
    engine: options,
    setup : function(namespace, structure, editmode) {
      // Iterate LDS-structure to register all partials as partials like component:mycomponent
      objectDeepMap(structure, (value) => {
        if (value && value.isLDSObject) {
          // Register default template
          if (value.template) {
            var template = value.template;
            // Iterate LDS-structure to register all partials as partials like component:mycomponent
            if (value.config && value.config.schema) {
              template = `{{{__LDSPartialStart '${value.partialName}' this '${obj2json(value.config.schema)}' }}}${template}{{{__LDSPartialEnd '${value.partialName}'}}}`;
            }

            options.registerPartial(value.partialName, template);
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

      return function *(next) {
        var structure = this[namespace].structure;

        var api = Object.assign(options, {
          renderView(view, data, asReturn, editmode) {
            data = data || {};
            if (!view) {
              view = structure.views['404'] || {template: '404 Page Not found', data: {}};
            }

            var defaultData = this.defaultData || {};
            var viewData = Object.assign({layout: 'default'}, view.data, data);
            if (editmode || data.editmode) {
              objectDeepMap(viewData, (value, key, path) => {
                // Is value an object
                if (value === Object(value)) {
                  value.__objectPath = path.length ? path + '.' + key : key;
                }
                return value;
              });
            }

            var layout = viewData.layout && structure.layouts[viewData.layout] ? structure.layouts[viewData.layout] : false;
            var layoutData = layout && layout.data || {};
            var pageData = Object.assign(defaultData, layoutData, viewData);
            var viewTemplate = view.template;

            if (editmode || data.editmode && view.config && view.config.schema) {
              viewTemplate = `{{{__LDSPartialStart '${view.partialName}' this '${obj2json(view.config.schema)}' }}}${viewTemplate}{{{__LDSPartialEnd '${view.partialName}'}}}{{{__LDSEditScript}}}`;
            }
            var template = layout ? layout.template.replace(/{{{@body}}}/, viewTemplate) : viewTemplate;

            var html = options.render(template, pageData);

            if (asReturn) {
              return html;
            }

            this.type = 'text/html; charset=utf-8';
            this.body = html;
          }
        });

        this[namespace].render = options.render.bind(this);
        this[namespace].renderView = api.renderView.bind(this);

        yield next;
      };
    }
  };
}
