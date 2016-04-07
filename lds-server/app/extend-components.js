var path = require('path');
var Prism = require('prismjs');
var postcss = require('postcss');
var languages = require('prism-languages');

module.exports = function extendComponents(config) {
  return function* parser(next) {
    var structure = this[config.namespace].structure;

    objectDeepMap(structure, (value, key) => {
      if (value && value.isLDSObject) {
        if (value.styles || value.script || value.template) {
          value.code = {};

          if (value.styles) {
            value.css = parseCSS(value);
            value.code.styles = Prism.highlight(value.styles, languages.css);
          }
          if (value.script) {
            value.js = parseJS(value);
            value.code.script = Prism.highlight(value.script, languages.js);
          }
          if (value.template) {
            value.hbs = parseTemplate(value);
            value.code.template = Prism.highlight(value.template, languages.handlebars);
          }
        }
        if (value.data) {
          value.data = resolveData(value.data, structure);
          //value.highlights.data = Prism.highlight(value.data, Prism.languages.json);
        }
        if (value.example && typeof value.example === 'string') {
          // Render on server since to show pre rendered markup in styleguide
          value.example = this.render(value.example, value);
        }
        if (value.category === 'view') {
          value.url = value.id.replace(/^\/views/, '');

          if (this.request.url === value.url) {
            this.renderView(value.url);
          }
        }
      }
      return value;
    });

    yield next;
  }
}

function objectDeepMap(object, callback) {
  Object.keys(object).map((key) => {
    object[key] = callback(object[key], key);

    if (typeof object[key] === 'object' && (key !== 'data' && key !== 'config' && key !== 'script')) {
      objectDeepMap(object[key], callback);
    }
  })
  return object;
}

function resolveData(data, structure) {
  objectDeepMap(data, (value) => {
    if (typeof value === 'string' && value.match(/@data:([^:]*):(.*)/)) {
      var strmatch = value.match(/@data:([^:]*):(.*)/);
      var component = structure[strmatch[1]][strmatch[2]];
      if (!component || !component.data) {
        return {};
      }
      return resolveData(component.data, structure);
    }
    return value;
  });
  return data;
}
function resolveDependency(url, current) {
  // ../../{category}/{name} => category/name
  // ../{name} => samecategory/name
  // {category}:{name}(/special)? => category:name

  // After getting depency add current to dependentBy
  return url;
}
// Use postCSS to parse CSS to look for :root element and add all css variables to component object
function parseCSS(component) {
  const variables = {};
  const modifiers = [];
  const dependencies = [];

  postcss.parse(component.styles)
    .nodes.forEach((node) => {
      const isModifier = node.type === 'rule' && node.selector.match(new RegExp(`${component.name}--([^ :]*)`, 'i'));
      const isRoot = node.selector === ':root' && typeof node.nodes === 'object';
      const isImport = node.type === 'atrule' && node.name === 'import';

      if (isRoot) {
        node.nodes.forEach((rule) => {
          if (rule.prop && rule.value) {
            variables[rule.prop.replace(/^--/, '')] = rule.value;
          }
        });
      } else if (isModifier) {
        modifiers.push(isModifier);
      } else if (isImport) {
        dependencies.push(resolveDependency(node.params, component));
      }
    });

  return {
    variables,
    modifiers,
    dependencies,
  }
}

// Parse script content to register all dependencies from its content
function parseJS(component) {
  const dependencies = [];
  const varStatements = component.script.match(/import ([^ ]*) from ["']([^"']*)["']/g);

  if (varStatements) {
    varStatements.forEach((statement) => {
      var matches = statement.match(/import ([^ ]*) from ["']([^"']*)["']/);
      let dependency = {};
      dependency[matches[1]] = matches[2];
      dependencies.push(resolveDependency(dependency, component));
    });
  }

  return {
    dependencies,
  };
}
function parseTemplate(component) {
  var dependencies = [];
  var dependencyMatch = new RegExp('(base|component|module):([^ "}]*)', 'g');
  var matches = component.template.match(dependencyMatch) || [];
  matches.forEach((match) => {
    dependencies.push(resolveDependency(match, component));
  });
  return {
    dependencies,
  }
}
