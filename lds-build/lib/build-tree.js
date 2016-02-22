/* Build a JSON object containing the projects entire structure containing components, view, modules and helpers */
var fs = require('fs-extra');
var path = require('path');
var postcss = require('postcss');
var trace = require('./trace');

module.exports = function buildTree(config) {
  var tree = {
    base: config.path.base ? parseDirectory(path.join(config.path.dirname, config.path.base)) : false,
    components: config.path.components ? parseDirectory(path.join(config.path.dirname, config.path.components)) : false,
    modules: config.path.modules ? parseDirectory(path.join(config.path.dirname, config.path.modules)) : false,
    modules: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.views)) : false,
    helpers: config.path.helpers ? parseDirectory(path.join(config.path.dirname, config.path.helpers)) : false,
    config: config
  };

console.log('writing', path.join(config.path.dirname, config.path.dist, config.dest.tree), JSON.stringify(tree));
  fs.writeFile(path.join(config.path.dirname, config.path.dist, config.dest.tree), JSON.stringify(tree), 'utf8', function(err) {
    if (err) {
      throw err;
    }
    console.log('tree structure saved to ', config.dest.tree);
  });
}
function parseDirectory(directory) {
  const directoryComponents = {};
  const componentsTree = trace(directory);

  Object.keys(componentsTree).forEach((name) => {
    const tree = componentsTree[name];
    const component = {
      name,
      info: tree['readme.md'],
      template: tree['index.hbs'],
      example: tree['example.hbs'],
      script: tree['index.js'],
      styles: tree['index.css'],
      data: tree['default.json'] ? JSON.parse(tree['default.json']) : {},
      config: tree['config.json'] ? JSON.parse(tree['config.json']) : false
    };

    // Use postCSS to parse CSS to look for :root element and add all css variables to component object
    if (component.styles) {
      const variables = {};
      postcss.parse(component.styles, { from: path.join(directory, name, 'index.css')})
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

    directoryComponents[name] = component;
  });

  return directoryComponents;
}
