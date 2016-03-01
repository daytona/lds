var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');
var postcss = require('postcss');
var trace = require('../lib/trace');

function parseLdsComponents(config, options) {
  options = options || {};

  return {
    base: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.base), Object.assign(options, {registerPartial: true, category: 'base'})) : false,
    components: config.path.components ? parseDirectory(path.join(config.path.dirname, config.path.components), Object.assign(options, {registerPartial: true, category: 'component'})): false,
    modules: config.path.modules ? parseDirectory(path.join(config.path.dirname, config.path.modules), Object.assign(options, {registerPartial: true, category: 'module'})) : false,

    // Parse views, but do not register them as partials
    views: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.views), Object.assign(options, {registerPartial: false, category: 'view'})) : false,
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
      template: tree['index.hbs'],
      example: tree['example.hbs'],
      script: tree['index.js'],
      styles: tree['index.css'],
      data: compData ? JSON.parse(compData) : {},
      config: tree['config.json'] ? JSON.parse(tree['config.json']) : false,
      category: options.category
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

      if (Object.keys(variables).length) {
        component.css = {
          variables,
          modifiers,
          dependencies,
        }
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

    // If component has template, register it as a partial to be used later
    if (component.template) {
      let dependencies = [];
      const partialStrings = component.template.match(/{{> ?([^}]*)}}/g);
      if (partialStrings) {
        dependencies = partialStrings.map((string) => {
          return string.replace(/\{\{> ?([^}]*)\}\}/, (org, s1) => {
            return s1;
          });
        });
        component.hbs = {
          dependencies
        };
      }
      component.template = component.template.replace(/({{> ?)([^}]*)(}})/g, function(template, before, partialName, after) {
        dependencies.push(partialName);

        if ( options.prefix &&
             !partialName.match(new RegExp(`^${options.prefix}:`)) &&
             !partialName.match(/^\(/) ) {
          partialName = `${options.prefix}:${partialName}`
        }

        return `${before}${partialName}${after}`;
      });

      if (options.prefix) {
        component.template = component.template.replace(/(class=['"])([^'"]*)(['"])/g, function(template, before, classes, after) {
          var classString = classes.split(' ').map((str) => {
            if (str.match(/^js/) ||
                str.match(/^{{prefix}}/)) {
              return str;
            }
            return `${options.prefix}-${str}`;
          }).join(' ');

          return `${before}${classString}${after}`;
        });
      }

      // Register template as partial
      if (options.registerPartial) {
        const partialName = options.prefix ? `${options.prefix}:${name}` : name;
        handlebars.registerPartial(partialName, component.template);
      }
    }

    // If example file is present, prerender it using the component object as data
    if (component.example && options.registerPartial) {
      const partialName = options.prefix ? `${options.prefix}:${name}` : name;
      handlebars.registerPartial(`example:${partialName}`, component.example);
    }

    directoryComponents[name] = component;
  });
  return directoryComponents;
}

module.exports = parseLdsComponents;
