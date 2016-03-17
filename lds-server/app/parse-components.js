var path = require('path');
var fs = require('fs');
var trace = require('../lib/trace');

module.exports = function parseComponents(config) {
  return function* parser (next) {
    this.lds = {
      structure : {
        base: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.base), Object.assign(config, {category: 'base', group: 'base'})) : false,
        components: config.path.components ? parseDirectory(path.join(config.path.dirname, config.path.components), Object.assign(config, {category: 'component', group: 'components'})): false,
        modules: config.path.modules ? parseDirectory(path.join(config.path.dirname, config.path.modules), Object.assign(config, {category: 'module', group: 'modules'})) : false,
        helpers: config.path.helpers ? parseDirectory(path.join(config.path.dirname, config.path.helpers), Object.assign(config, {category: 'helper', group: 'helpers'})) : false,
        views: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.views), Object.assign(config, {category: 'view', group: 'views'})) : false,
        layouts: config.path.layouts ? parseDirectory(path.join(config.path.dirname, config.path.layouts), Object.assign(config, {category: 'layout', group: 'layouts'})) : false,
      },
      config,
    };
    yield next;
  }
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
      template: tree['index.' + options.engine.ext],
      example: tree['example.' + options.engine.ext],
      script: tree['index.js'] || tree['index.jsx'],
      styles: tree['index.css'] || tree['index.scss'] || tree['index.less'] || tree['index.styl'],
      data: compData ? JSON.parse(compData) : {},
      config: tree['config.json'] ? JSON.parse(tree['config.json']) : false,
      category: options.category,
      group: options.group
    };

    directoryComponents[name] = component;
  });
  return directoryComponents;
}
