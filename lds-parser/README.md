# LDS - Parser

This package parses all files in a LDS project and creates a LDS Object, with additional data, and sets the content of components into namespaces.

returns a structure object containing all components within documentation, base, components, modules, helpers, views, layouts.

for instance:

{
  components: [
    {
      isLDSObject: true,
      id: '/components/name',
      path: '[DIR_ON_SERVER]/components/name',
      name: name,
      partialName: 'component:name'
      info: [content of readme.md],
      template: [content of readme.hbs],
      example: [content of example.hbs],
      data: {[JSONDATA from default.json]},
      styles: [content of index.css],
      script: content of index.js],
      config: {[JSONDATA from config.json]},
      screen: '/assets/screens/component/name.png',
      category: 'component',
      group: 'components',
      children: false,
      templates: [Array of all template files in folder],
      files: [Array of all editable files in folder],
      dependentBy: [{Components which this component is dependent of},{},{}],
      dependencyTo: [{Components, which are dependent of this component}],
      code: {
        styles: "Rendered index.css in PrismJS",
        script: "Rendered index.js in PrismJS",
        template: "Rendered index.hbs in PrismJS"
      },
      revisions: {"Changes in files on current server, through API (styleguide or editor)"}
    },
    ...
  ],
  ...
}
