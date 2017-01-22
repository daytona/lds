var objectDeepMap = require('./lib/object-deep-map');

module.exports = function Engine(options) {
  options.registerHelper('jsonLine', function(obj){
    return JSON.stringify(obj).replace(/\"/g, '\\"');
  });
  var once = false;
  options.registerHelper('dataPath', function(root, obj, options){
    var deepPath = '';
    objectDeepMap(root, (value, key, path) => {
      if (obj == value) {
        console.log(path);
        deepPath = value.objectPath ? value.objectPath + '.' + key : key;
      }
      return value;
    });
    return deepPath;
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
        var structure = this[namespace].structure;
        var editmode = this.editmode;
        // Iterate LDS-structure to register all partials as partials like component:mycomponent
        objectDeepMap(structure, (value) => {
          if (value && value.isLDSObject) {
            // Register default template
            if (value.template) {
              if (editmode && value.config && value.config.schema) {
                value.template = `<!-- component="${value.partialName}" datapath="{{$objectPath}}" data="{{jsonLine this}}" schema="${JSON.stringify(value.config.schema).replace(/\"/g,"&quot\;")}"-->${value.template}<!-- /${value.partialName} -->`;
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
              viewTemplate = viewTemplate+'<script>window.PageData = "{{jsonLine this}}".replace(/(&quot\;)/g, \'\"\');</script>';
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
