var path = require('path');
var Prism = require('prismjs');
var postcss = require('postcss');

module.exports = function extendComponents() {
  return function* parser(next) {
    var structure = this.lds.structure;

    objectDeepMap(structure, (value) => {
      if (value && typeof value === 'object') {
        if (value.styles) {
          value.css = parseCSS(value);
          value.styles = Prism.highlight(value.styles, Prism.languages.css);
        }
        if (value.script) {
          value.js = parseJS(value);
          value.script = Prism.highlight(value.script, Prism.languages.js);
        }
        if (value.data) {
          value.data = resolveData(value.data, structure);
        }
        if (value.example) {
          value.example = this.render(value.example, value);
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

// Use postCSS to parse CSS to look for :root element and add all css variables to component object
function parseCSS(component) {
  const variables = {};
  const modifiers = [];
  const dependencies = [];

  postcss.parse(component.styles)
    .nodes.forEach((node) => {
      const isModifyer = node.type === 'rule' && node.selector.match(new RegExp(`${component.name}--(.*)`, 'i'));
      const isRoot = node.selector === ':root' && typeof node.nodes === 'object';
      const isvar = node.type === 'rule' && node.type === 'atrule' && node.name === 'var';

      if (isRoot) {
        node.nodes.forEach((rule) => {
          if (rule.prop && rule.value) {
            variables[rule.prop.replace(/^--/, '')] = rule.value;
          }
        });
      } else if (isModifyer) {
        modifiers.push(isModifyer[1]);
      } else if (isvar) {
        dependencies.push(node.params);
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
  const dependencies = {};
  const varStatements = component.script.match(/import ([^ ]*) from ["']([^"']*)["']/g);

  if (varStatements) {
    varStatements.forEach((statement) => {
      var matches = statement.match(/import ([^ ]*) from ["']([^"']*)["']/);
      dependencies[matches[1]] = matches[2];
    });
  }

  return {
    dependencies,
  };
}
