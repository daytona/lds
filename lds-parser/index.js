var path = require('path');
var fs = require('fs');
var jsonlint = require('jsonlint');
var trace = require('./lib/trace');
var pathExists = require('./lib/path-exists');
var objectDeepMap = require('./lib/object-deep-map');
var postcss = require('postcss');
var Prism = require('prismjs');
var languages = require('prism-languages');
var findComponent = require('./lib/find-component');

module.exports = {
  async: parseComponentsAsync,
  sync: parseComponents
};

function parseComponents(config) {
  var structure = {
    documentation: config.path.documentation ? parseDirectory(path.join(config.path.dirname, config.path.documentation), {config, category: 'documentation', group: 'documentation'}) : false,
    base: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.base), {config, category: 'base', group: 'base'}) : false,
    components: config.path.components ? parseDirectory(path.join(config.path.dirname, config.path.components), {config, category: 'component', group: 'components'}): false,
    modules: config.path.modules ? parseDirectory(path.join(config.path.dirname, config.path.modules), {config, category: 'module', group: 'modules'}) : false,
    helpers: config.path.helpers ? parseDirectory(path.join(config.path.dirname, config.path.helpers), {config, category: 'helper', group: 'helpers'}) : false,
    views: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.views), {config, category: 'view', group: 'views'}) : false,
    layouts: config.path.layouts ? parseDirectory(path.join(config.path.dirname, config.path.layouts), {config, category: 'layout', group: 'layouts'}) : false,
  };

  objectDeepMap(structure, (value, key) => {
    if (value && value.isLDSObject) {
      if (value.styles || value.script || value.template) {
        value.code = {};

        if (value.styles) {
          value = parseCSS(value, structure);
          value.code.styles = Prism.highlight(value.styles, languages.css);
        }
        if (value.script) {
          value = parseJS(value, structure);
          value.code.script = Prism.highlight(value.script, languages.js);
        }
        if (value.template) {
          value = parseTemplate(value, structure);
          value.code.template = Prism.highlight(value.template, languages.handlebars);
        }
      }
      if (value.data) {
        value.data = resolveData(value.data, structure);
      }

      if (value.config && value.config.schema) {
        value.config.schema = resolveConfigSchema(value.config.schema, structure);
      }

      if (value.category === 'view') {
        value.url = value.id.replace(/^\/views/, '');
      }
    }
    return value;
  });

  // And a third time to resolve more dependencies
  objectDeepMap(structure, (value, key) => {
    if (value && value.isLDSObject) {
      if (value && value.css && value.css.usedVariables && value.css.usedVariables.length) {
        value = resolveCSSDependencies(value, structure);
      }
    }
    return value;
  });

  return {
    structure,
    config
  };
}

function parseComponentsAsync(config) {
  return function* parser (next) {
    this[config.namespace] = parseComponents(config);
    yield next;
  }
}

function parseComponent(name, tree, options) {
  var isComponent = false;
  var isTemplate = new RegExp(`\.${options.config.engine.ext}$`);
  var children = {};
  var templates = [];

  Object.keys(tree).forEach((fileName) => {
    // isFolder
    if (typeof tree[fileName] === 'object') {

      var child = parseComponent(name + '/' + fileName, tree[fileName], Object.assign({}, options, {
        //group: `${options.group}/${name}`,
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
  var componentData;
  var componentConfig;

  if (tree['index.json'] || tree['default.json']) {
    try {
      var json = tree['index.json'] || tree['default.json'];
      componentData = jsonlint.parse(json);
    } catch (err) {
      console.error('Invalid JSON data in component', encodeURI(`/${options.group}/${name}`));
      throw err;
    }
  }

  if (tree['config.json']) {
    try {
      var json = tree['config.json'];
      componentConfig = jsonlint.parse(json);
    } catch (err) {
      console.error('Invalid JSON config in component', encodeURI(`/${options.group}/${name}`));
      throw err;
    }
  }
  var id = encodeURI(`/${options.group}/${name}`);
  var screendumpUrl = path.join(options.config.path.dirname, options.config.path.dist, 'screens' + id + '.png');

  var screen = (tree['screen.png'] && path.join(options.path, 'screen.png') ||
               tree['screen.jpg'] && path.join(options.path, 'screen.jpg') ||
               tree['screen.gif'] && path.join(options.path, 'screen.gif') ||
               path.join(options.config.path.public, 'screens' + id + '.png'))

  var revisions = {};
  if (tree['.versions']) {
    Object.keys(tree['.versions']).forEach((filename) => {
      var filenamematch = filename.match(/^(.*)\.(.*)$/);
      var name = filenamematch[1];
      var timestamp = filenamematch[2];
      if (!revisions[name]) {
        revisions[name] = {};
      }
      revisions[name][timestamp] = tree['.versions'][filename];
    });
  }
  var codeFiles = {};
  Object.keys(tree).forEach(file => {
    if (file.match(/\.(json|js|css|styl|jsx|scss|hbs|handlebars|mustache|htm|html|md)$/)) {
      codeFiles[file] = tree[file];
    }
  });

  var LDSObject = {
    id,
    path: encodeURI(options.path),
    name,
    files: codeFiles,
    partialName: options.partialName || `${options.category}:${name}`,
    info: tree['readme.md'] || tree['index.md'],
    template: tree['index.' + options.config.engine.ext],
    example: tree['example.' + options.config.engine.ext],
    data: componentData,
    styles: tree['index.css'] || tree['index.scss'] || tree['index.less'] || tree['index.styl'],
    script: tree['index.js'] || tree['index.jsx'],
    config: componentConfig,
    screen,
    category: options.category,
    group: options.group,
    children: Object.keys(children).length > 0 && children,
    templates: templates.length > 0 && templates,
    isLDSObject: true,
    dependentBy: [],  // To be added later
    dependencyTo: [],  // To be added later
    revisions: revisions
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

  var directoryComponents = {};
  var componentsTree = trace(directory);

  Object.keys(componentsTree).forEach((name) => {
    var fileStat = fs.statSync(path.join(directory, name));
    if (fileStat.isFile()) {
      return false;
    }
    var tree = componentsTree[name];
    var component = parseComponent(name, tree, Object.assign(options, {path: path.join(directory, name)}));
    if (component) {
      directoryComponents[name] = component;
    }
  });
  return directoryComponents;
}

// Insert data from an other component in default data
function resolveData(data, structure) {
  objectDeepMap(data, (value) => {
    if (typeof value === 'string' && value.match(/@data:(.*)/)) {
      var strmatch = value.match(/@data:(.*)/);
      var component = resolvePartial(strmatch[1], structure);
      if (!component || !component.data) {
        return {};
      }
      return resolveData(component.data, structure);
    }
    return value;
  });
  return data;
}
// resolve relative URL path from one component to an other
function resolvePath(current, relative, structure) {
  var path = current.split('/');
  relative.split('/').forEach((dir) => {
    if (dir === '..') {
      path.splice(-1);
    } else if (dir !== '.') {
      path.push(dir);
    }
  });
  return findComponent(structure, path.join('/'));
}

// Get component from partial string {{> component:button}}
function resolvePartial(partialString, structure) {
  return findComponent(structure, (value) => {
    return value.partialName === partialString;
  });
}

// Update component config with schemas from related components (if defined in eg. {@schema: "@schema:component:Title"})
function resolveConfigSchema(schema, structure) {
  objectDeepMap(schema, (value) => {
    if (value.$type && Array.isArray(value.$type)) {
      var options = {};
      value.$type.forEach(type => {
        options[type.replace(/^@schema:/, '')] = resolveConfigSchema(type, structure);
      });
      value.$type = options;
    } else if (typeof value === 'string' && value.match(/@schema:(.*)/)) {
      var strmatch = value.match(/@schema:(.*)/);
      var component = resolvePartial(strmatch[1], structure);
      if (!component || !component.config || !component.config.schema) {
        return {};
      }
      return resolveConfigSchema(component.config.schema, structure);
    }
    return value;
  });
  return schema;
}
function resolveCSSDependencies(component, structure) {
  var variableDependencies = component.dependentBy || [];
  if (component.css.usedVariables) {
    component.css.usedVariables.forEach(variable => {
      if (!component.css.variables[variable]) {
        var dependencyComponent = findComponent(structure, (value) => {
          return value && value.css && value.css.variables && value.css.variables[variable];
        });
        if (dependencyComponent && !variableDependencies.filter(dep => {
          // Already in dependencyList?
          return dep.id === dependencyComponent.id;
        }).length) {
          variableDependencies.push({name: dependencyComponent.name, partialName: dependencyComponent.partialName, id: dependencyComponent.id});
        }
      }
    });
  }
  component.dependentBy = variableDependencies;
  return component;
}

// Use postCSS to parse CSS to look for :root element and add all css variables to component object
function parseCSS(component, structure) {
  var variables = {};
  var modifiers = [];
  var usedVariables = component.styles.match(/var\(--([^\)]*)\)/g) || [];
  if (usedVariables.length) {
    usedVariables = usedVariables.map(string => {
      return string.replace(/var\(--([^\)]*)\)/, (str, name) => {
        return name;
      });
    });
  }

  postcss.parse(component.styles)
    .nodes.forEach((node) => {
      var isModifier = node.type === 'rule' && node.selector.match(new RegExp(`${component.name}--([^ :]*)`, 'i'));
      var isRoot = node.selector === ':root' && typeof node.nodes === 'object';
      var isImport = node.type === 'atrule' && node.name === 'import';

      if (isRoot) {
        node.nodes.forEach((rule) => {
          if (rule.prop && rule.value) {
            variables[rule.prop.replace(/^--/, '')] = rule.value;
          }
        });
      } else if (isModifier) {
        modifiers.push(isModifier);
      } else if (isImport) {
        var dependency = resolvePath(component.id, node.params.replace(/[\"\']/g, ''), structure);
        if (dependency && component.dependentBy.filter((dependencyLite) => {
          return dependency.id === dependencyLite.id;
        }).length === 0) {
          component.dependentBy.push({name: dependency.name, partialName: dependency.partialName, id: dependency.id});
          dependency.dependencyTo.push({name: component.name, partialName: component.partialName, id: component.id});
        }
      }
    });

  component.css = {
    usedVariables,
    variables,
    modifiers
  }
  return component;
}

// Parse script content to register all dependencies from its content
function parseJS(component, structure) {
  var dependencies = [];
  var varStatements = component.script.match(/import ([^ ]* from )?["']([^"']*)["']/g);

  if (varStatements) {
    varStatements.forEach((statement) => {
      var matches = statement.match(/import ([^ ]* from )?["']([^"']*)["']/);

      var dependency = resolvePath(component.id, matches[2], structure);
      if (dependency && component.dependentBy.filter((dependencyLite) => {
        return dependency.id === dependencyLite.id;
      }).length === 0) {
        component.dependentBy.push({name: dependency.name, partialName: dependency.partialName, id: dependency.id});
        dependency.dependencyTo.push({name: component.name, partialName: component.partialName, id: component.id});
      }
    });
  }
  return component;
}

// Find partial references to other component and add as dependency
function parseTemplate(component, structure) {
  var dependencyMatch = new RegExp('(base|component|module):([^ "}]*)', 'g');
  var matches = component.template.match(dependencyMatch) || [];
  matches.forEach((match) => {
    var dependency = resolvePartial(match, structure);
    if (dependency && component.dependentBy.filter((dependencyLite) => {
      return dependency.id === dependencyLite.id;
    }).length === 0) {
      component.dependentBy.push({name: dependency.name, partialName: dependency.partialName, id: dependency.id});
      dependency.dependencyTo.push({name: component.name, partialName: component.partialName, id: component.id});
    }
  });
  return component;
}
