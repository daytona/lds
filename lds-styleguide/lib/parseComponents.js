var path = require('path');
var fs = require('fs');
var trace = require('./trace');

function parseLdsComponents(config, options) {
  options = options || {};

   var lds = {
    base: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.base), Object.assign(options, {category: 'base'})) : false,
    components: config.path.components ? parseDirectory(path.join(config.path.dirname, config.path.components), Object.assign(options, {category: 'component'})): false,
    modules: config.path.modules ? parseDirectory(path.join(config.path.dirname, config.path.modules), Object.assign(options, {category: 'module'})) : false,
    helpers: config.path.helpers ? parseDirectory(path.join(config.path.dirname, config.path.helpers), Object.assign(options, {category: 'helper'})) : false,
    // Parse views, but do not register them as partials
    views: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.views), Object.assign(options, {category: 'view'})) : false,
    layouts: config.path.layouts ? parseDirectory(path.join(config.path.dirname, config.path.layouts), Object.assign(options, {category: 'layout'})) : false,
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
      category: options.category
    };

    directoryComponents[name] = component;
  });
  return directoryComponents;
}

module.exports = parseLdsComponents;
