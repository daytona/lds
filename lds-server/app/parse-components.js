var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');
var postcss = require('postcss');
var trace = require('../lib/trace');

function parseLdsComponents(config, options) {
  options = options || {};

   var lds = {
    base: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.base), Object.assign(options, {category: 'base', group: 'base'})) : false,
    components: config.path.components ? parseDirectory(path.join(config.path.dirname, config.path.components), Object.assign(options, {category: 'component', group: 'components'})): false,
    modules: config.path.modules ? parseDirectory(path.join(config.path.dirname, config.path.modules), Object.assign(options, {category: 'module', group: 'modules'})) : false,
    helpers: config.path.helpers ? parseDirectory(path.join(config.path.dirname, config.path.helpers), Object.assign(options, {category: 'helper', group: 'helpers'})) : false,
    // Parse views, but do not register them as partials
    views: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.views), Object.assign(options, {category: 'view', group: 'views'})) : false,
    layouts: config.path.layouts ? parseDirectory(path.join(config.path.dirname, config.path.layouts), Object.assign(options, {category: 'layout', group: 'layouts'})) : false,
  }
  return lds;
}

// Parse directories for components and add them to components object
function parseDirectory(directory, options) {
  if (!directory) {
    return {};
  }

  const directoryComponents = {};
  const componentsTree = trace(directory);

  Object.keys(componentsTree).forEach((name) => {
    if (fs.statSync(path.join(directory, name)).isFile()) {
      return false;
    }
    const tree = componentsTree[name];
    const compData = tree['default.json'] || tree['index.json'];

    const component = {
      name,
      info: tree['readme.md'],
      template: tree['index.hbs'],
      example: tree['example.hbs'],
      script: tree['index.js'],
      styles: tree['index.css'],
      data: compData ? JSON.parse(compData) : {},
      config: tree['config.json'] ? JSON.parse(tree['config.json']) : false,
      category: options.category,
      group: options.group
    };

    // Use postCSS to parse CSS to look for :root element and add all css variables to component object
    if (component.styles) {
      const variables = {};
      const modifiers = [];
      const dependencies = [];

      postcss.parse(component.styles, { from: path.join(directory, name, 'index.css')})
        .nodes.forEach((node) => {
          const isModifyer = node.type === 'rule' && node.selector.match(new RegExp(`${name}--(.*)`, 'i'));
          const isRoot = node.selector === ':root' && typeof node.nodes === 'object';
          const isvar = node.type === 'rule' && node.type === 'atrule' && node.name === 'var';

          if (isRoot) {
            node.nodes.forEach((rule) => {
              variables[rule.prop.replace(/^--/, '')] = rule.value;
            });
          } else if (isModifyer) {
            modifiers.push(isModifyer[1]);
          } else if (isvar) {
            dependencies.push(node.params);
          }
        });

      component.css = {
        variables,
        modifiers,
        dependencies,
      }
    }

    // Parse script content to register all dependencies from its content
    if (component.script) {
      const dependencies = {};
      const varStatements = component.script.match(/import ([^ ]*) from ["']([^"']*)["']/g);

      if (varStatements) {
        varStatements.forEach((statement) => {
          var matches = statement.match(/import ([^ ]*) from ["']([^"']*)["']/);
          dependencies[matches[1]] = matches[2];
        });
      }

      component.js = {
        dependencies,
      };
    }

    directoryComponents[name] = component;
  });
  return directoryComponents;
}

module.exports = parseLdsComponents;
