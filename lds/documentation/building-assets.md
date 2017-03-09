## Building Assets

LDS will build all scripts (index.js) and styles (index.css) in components by running ```$ lds build``` or ```$ lds watch```.

## Building scripts
For scripts we use Browserify to find all files named index.js and running them through babelify to create one bundle of all scripts.

You define the destination and name of this bundle in your lds.config.js.
```
dest.script: 'main.js'
```

You can also create custom bundles by defining and array of scripts in your lds.config.js.
```
dest.scripts: [
  {
    src: ['src/components/mycomponent', 'src/helpers'],
    dest: 'special-bundle.js'
  }
]
```
more about this in [Configuration](./configuration.md)

## Building styles
Styles a bundled using PostCSS mostly the same way as scripts. All files called index.css without the source directory will be bundled into one bundle.

The build script will automatically apply postcss-cssnext, cssnano, css-import and postcss-class-prefix. Allowing for clean future standard CSS using css variables (across files), custom-queries and autoprefixing, delivering a minified (with sourcemap for dev) bundle.

You can configure the post-css process as well by including other middlewares from your lds.config.js, for instance:
```
postcss: [require('postcss-scss')]
```

## Building of images
All images within the source assets/images folder will be minified and copied to the public dist folder for use in the prorotype by refering /assets/images/myImage.jpg. (The naming of assets and imagesfolder can be configured in your lds.config.js file)

## Building of icons
Any icon with the source icon directory, will automaticall be transferred into a web-font and generating a Icon componente defining variables and class names to use any icon "out of the box". This will soon be updated to generate SVG sprite instead. stay tuned.

## Building fonts
Fonts in src/fonts will be copied to the dist folder where they can be included as webfonts via url('/assets/fonts/myfont.woff2'). (The assets and fonts paths can be configured in lds.config.js.)

Call build for all or for specific type.
```
$ lds build
$ lds build script
$ lds build styles
$ lds build icons
$ lds build images
$ lds build fonts
```
or continous wathing for file change using:
```
$ lds watch
```
When in watch mode, the API will also fire a reload event to all connected clients, reloading them whenever new content is available, making testing on multiple devices a charm.
