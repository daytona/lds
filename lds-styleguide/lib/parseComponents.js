var path = require('path');
var trace = require('./trace');
var postcss = require('postcss');

var components = {};
function parseComponents(config) {

  if (components.length) {
    return components;
  }

  var componentsTree = trace(path.join(config.path.dirname, config.path.components));

  Object.keys(componentsTree).forEach((name) => {
    const tree = componentsTree[name];
    const component = {
      name,
      info: tree['readme.md'],
      template: tree['index.hbs'],
      script: tree['index.js'],
      styles: tree['index.css'],
      data: tree['default.json'] ? JSON.parse(tree['default.json']) : {},
      config: tree['config.json'] ? JSON.parse(tree['config.json']) : false
    };

    // Use postCSS to parse CSS to look for :root element and add all css variables to component object
    if (component.styles) {
      const variables = {};
      postcss.parse(component.styles, { from:  path.join(config.path.dirname, config.path.components)})
        .nodes.filter((node) => {
          return node.selector === ':root' && typeof node.nodes === 'object';
        }).forEach((root) => {
          return root.nodes.map((rule) => {
            variables[rule.prop.replace(/^--/, '')] = rule.value;
          });
        });
      if (Object.keys(variables).length) {
        component.variables = variables;
      }
    }
    components[name] = component;
  });
  return components;
}

module.exports = parseComponents;
