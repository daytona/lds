## Configuration
You can configure the way you work with LDS for your specific needs using the lds.config.js file.

Lets go through the configuration and discuss how to acomplish your needs.

## Engine
You can change what tempalte language to use for generating markup, including the template engine as part of the lds.config.js file.
Three functions need to be defined, render (convert template to html), registerHelper (add template methods if possible), registerPartial (register each component as a partial).

In addition tou need to specify which file extension to expect for template files, and helpers, which is a js object of default helper functions to include.
```
engine: {
  render(string, data) {
    if (string) {
      return handlebars.compile(string)(data);
    }
  },
  registerHelper (name, fn) {
    return handlebars.registerHelper(name, fn);
  },
  registerPartial(name, fn) {
    return handlebars.registerPartial(name, fn);
  },
  helpers,
  ext: 'hbs'
}
```
## Path
You can change which types of componentes you need and where on the disk to find them.
If you don´t need a type of components just define it as false.
```
path : {
  dirname: process.cwd(),         // project root folder
  documentation: 'documentation', // Documentation components (containing index.md)
  base: 'src/base',               // Base component directory (Core variables and styling)
  components: 'src/components',   // Components directory (Reusable component)
  modules: 'src/modules',         // Module directory (More complex components)
  helpers: 'src/helpers',         // Helper directory (reusable js, and template helpers)
  views: 'src/views',             // View directory (The routes which will be served)
  layouts: 'src/layouts',         // Document layout directory (HTML document)
  dist: 'dist',                   // Destination folder for build assets
  public: '/assets',              // The public path to the dist folder within browser
  icons: 'src/assets/icons',      // Source of icon assets (svg files)
  fonts: 'src/assets/fonts',      // Source of web fonts (.ttf .otf .woff .woff2 .svg etc.)
  images: 'src/assets/images'     // Source of image assets
}
```
## File destinations
For the build process ytou can also define the file names to generate.

```
dest: {
  script: 'main.js',    // JavaScript bundle
  style: 'style.css',   // Stylesheet bundle
  images: 'images',     // Images folder (in dist)
  fonts: 'fonts',       // Font folder (in dist)
  html: 'html'          // HTML output folder for API-export (in dist)
  scripts: [{           // Define custom js bundles, with subsets of components
    src: ['src/components/mycomponent', 'src/helpers'],
    dest: 'special-bundle.js'
  }],
  styles: [{           // Define custom css bundles, with subsets of components
    src: ['src/components/mycomponent', 'src/helpers'],
    dest: 'special-bundle.css'
  }]
}
```

## PostCSS
You can extend the CSS build process by including additional postCSS plugins using the postcss parameter.
```
postcss: [require('postcss-scss')]
```

## Login
Lock the prototype and styleguide behind login authentication with this username and password
```
login: {
  name: 'daytona',
  pass: 'griffeltavla'
}
```

## Logotype
Change the styleguide logotype to this path
```
logotype: '/assets/images/logo.png'
```

## Port
Define which port the server should serve the prototype and styleguide.
```
port: 2000              // Port on which server should set up HTTP-Server
```
