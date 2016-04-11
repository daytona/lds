var path = require('path');
var fs = require('fs');
var trace = require('./lib/trace');
var pathExists = require('./lib/path-exists');

module.exports = function parseComponents(config) {
  return function* parser (next) {
    this[config.namespace] = {
      structure : {
        documentation: config.path.documentation ? parseDirectory(path.join(config.path.dirname, config.path.documentation), {config, category: 'documentation', group: 'documentation'}) : false,
        base: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.base), {config, category: 'base', group: 'base'}) : false,
        components: config.path.components ? parseDirectory(path.join(config.path.dirname, config.path.components), {config, category: 'component', group: 'components'}): false,
        modules: config.path.modules ? parseDirectory(path.join(config.path.dirname, config.path.modules), {config, category: 'module', group: 'modules'}) : false,
        helpers: config.path.helpers ? parseDirectory(path.join(config.path.dirname, config.path.helpers), {config, category: 'helper', group: 'helpers'}) : false,
        views: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.views), {config, category: 'view', group: 'views'}) : false,
        layouts: config.path.layouts ? parseDirectory(path.join(config.path.dirname, config.path.layouts), {config, category: 'layout', group: 'layouts'}) : false,
      },
      config,
    };
    yield next;
  }
}
function parseComponent(name, tree, options) {
  let isComponent = false;
  const isTemplate = new RegExp(`\.${options.config.engine.ext}$`);
  const children = {};
  const templates = [];

  Object.keys(tree).forEach((fileName) => {
    // isFolder
    if (typeof tree[fileName] === 'object') {
      let child = parseComponent(fileName, tree[fileName], Object.assign({}, options, {
        partialName: `${options.category}:${name}/${fileName}`,
        group: `${options.group}/${name}`,
        path: `${options.path}/${fileName}`
      }));
      if (child) {
        children[fileName] = child;
      }
      return;
    }

    if (isTemplate.test(fileName)) {
      templates.push({
        name: fileName.replace(isTemplate, ''),
        content: tree[fileName]
      });
    }
  });

  var LDSObject = {
    id: encodeURI(`/${options.group}/${name}`),
    path: encodeURI(options.path),
    name,
    partialName: options.partialName || `${options.category}:${name}`,
    info: tree['readme.md'] || tree['index.md'],
    template: tree['index.' + options.config.engine.ext],
    example: tree['example.' + options.config.engine.ext],
    data: (tree['index.json'] && JSON.parse(tree['index.json'])) || (tree['default.json'] && JSON.parse(tree['default.json'])),
    styles: tree['index.css'] || tree['index.scss'] || tree['index.less'] || tree['index.styl'],
    script: tree['index.js'] || tree['index.jsx'],
    config: tree['config.json'] && JSON.parse(tree['config.json']),
    screen: (tree['screen.png'] && path.join(options.path, 'screen.png') ||
             tree['screen.jpg'] && path.join(options.path, 'screen.jpg') ||
             tree['screen.gif'] && path.join(options.path, 'screen.gif')),
    category: options.category,
    group: options.group,
    children: Object.keys(children).length > 0 && children,
    templates: templates.length > 0 && templates,
    isLDSObject: true,
    dependentBy: [],  // To be added later
    dependencyTo: [],  // To be added later
  };

  if (LDSObject.template || LDSObject.script || LDSObject.styles || LDSObject.data || LDSObject.info || LDSObject.config || LDSObject.example || LDSObject.children) {
    return LDSObject;
  }
}

// Parse directories for components and add them to components object
function parseDirectory(directory, options) {
  if (!directory || !pathExists(directory)) {
    return false;
  }

  const directoryComponents = {};
  const componentsTree = trace(directory);

  Object.keys(componentsTree).forEach((name) => {
    let fileStat = fs.statSync(path.join(directory, name));
    if (fileStat.isFile()) {
      return false;
    }
    const tree = componentsTree[name];
    const component = parseComponent(name, tree, Object.assign(options, {path: path.join(directory, name)}));
    if (component) {
      directoryComponents[name] = component;
    }
  });
  return directoryComponents;
}
