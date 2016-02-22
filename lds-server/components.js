import path from 'path';
import handlebars from 'handlebars';
import postcss from 'postcss';
import trace from './lib/trace';

export default function parseLdsComponents(config, options = {}) {
  return {
    base: config.path.views ? parseDirectory(path.join(config.path.dirname, config.path.base), options) : false,
    components: config.path.components ? parseDirectory(path.join(config.path.dirname, config.path.components), options): false,
    modules: config.path.modules ? parseDirectory(path.join(config.path.dirname, config.path.modules), options) : false,
  }
}
// Parse directories for components and add them to components object
export function parseDirectory(directory, options) {
  if (!directory) {
    return {};
  }
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
      const modifiers = [];
      const dependencies = [];

      postcss.parse(component.styles, { from: path.join(directory, name, 'index.css')})
        .nodes.forEach((node) => {
          const isModifyer = node.type === 'rule' && node.selector.match(new RegExp(`${name}--(.*)`, 'i'));
          const isRoot = node.selector === ':root' && typeof node.nodes === 'object';
          const isImport = node.type === 'rule' && node.type === 'atrule' && node.name === 'import';

          if (isRoot) {
            node.nodes.forEach((rule) => {
              variables[rule.prop.replace(/^--/, '')] = rule.value;
            });
          } else if (isModifyer) {
            modifiers.push(isModifyer[1]);
          } else if (isImport) {
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
      const importStatements = component.script.match(/import ([^ ]*) from ["']([^"']*)["']/g);

      if (importStatements) {
        importStatements.forEach((statement) => {
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
      const partialName = options.prefix ? `${options.prefix}:${name}` : name;
      handlebars.registerPartial(partialName, component.template);
    }

    // If example file is present, prerender it using the component object as data
    if (component.example) {
      const partialName = options.prefix ? `${options.prefix}:${name}` : name;
      handlebars.registerPartial(`example:${partialName}`, component.example);
    }

    directoryComponents[name] = component;
  });
  return directoryComponents;
}
