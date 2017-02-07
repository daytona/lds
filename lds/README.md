# Living Design System (LDS)

LDS is a component management service, defining a way to write and manage components, modules and view, which makes it easy to maintain, view and develop.

## One folder per component
A component is a folder with all its defining assets within, like CSS, JavaScript, Template, default JSON data, configurations, screenshots, examples and description.
for instance:
```
 - MyComponent
  -- index.css
  -- index.js
  -- index.hbs
  -- default.json
  -- readme.md
```
By handling all component specifications in one place we can easier make sure CSS, JS and HTML are functioning together. And works as an instance independent on where in the DOM you put it.

Further more, by relying on a standardized way of strucuring your components, we can then parse the file structure and get a complete library of all components and their dependencies.

Living design system, is a way to handle this standardized way of structuring components, by indexing them, bundlinge their assets, serving them as templating partials, and creating an API allowing us to render them in isolation or modifying them.

LDS consists of several vital parts to make your job easier.
 - [LDS Build](https://www.npmjs.com/package/@daytona/lds-build): compiles and bundles all assets into a public folder.
 - [LDS Parser](https://www.npmjs.com/package/@daytona/lds-parser): Parses the file structure, returning a LDS object with all your components
 - [LDS Engine](https://www.npmjs.com/package/@daytona/lds-engine): Reads all template files and serves them as partials
 - [LDS Server](https://www.npmjs.com/package/@daytona/lds-server): Starts up a HTTP server serving your prototype, styleguide, api
 - [LDS CLI](https://www.npmjs.com/package/@daytona/lds-cli): Defines a "lds" namespace in terminal, enabling commands for, starting server, building and watching assets and generating new projects or components.
 - [LDS API](https://www.npmjs.com/package/@daytona/lds-api): defines a set of endpoints to present, render or update your components.
 - [LDS Styleguide](https://www.npmjs.com/package/@daytona/lds-styleguide): Creates a complete styleguide of your components, to get a better overview.
 - [LDS Create](https://www.npmjs.com/package/@daytona/lds-create): Generator for creating new components, modules, helpers, views or projects.
 - [LDS Test](https://www.npmjs.com/package/@daytona/lds-test): (TODO)Tests the status of your components and makes sure you don't commit any bugs.
 - [LDS Editor](https://www.npmjs.com/package/@daytona/lds-editor): (TODO)Opens a sandbox environment for a component, where you can modify and even save your changes.
 - [LDS Git](https://www.npmjs.com/package/@daytona/lds-git): (TODO) A Git implementation allowing for changes made in styleguide and editor to be committed to the project.

You can customize the file structure or templating engine, using the lds.config.js in your root project directory. Read more about customization in out [documentation](docs/customization.md)

## Installation

Install lds by installing it as global dependency

```bash
$ npm install -g @daytona/living-design-system
$ lds init myProject
```
or just
```bash
$ lds init
```
to set it up in current folder

This sets up a folder structure (which you can change) and a config file (lds.config.js) with all the paths and configurations of your project, and a simple example component.

To start up the server run command
```bash
$ lds start
```
This builds your assets, creating a watch task for file changes in your project and starts up a KOA.js server with routes for all your views and for a separate styleguide presenting your components and views, as well as a API, with commands to manage you design system.

## Documentation
* [Installation](https://github.com/daytona/lds/blob/master/lds/documentation/installation.md)
* [Getting started](https://github.com/daytona/lds/blob/master/lds/documentation/getting-started.md)
* [Commandline](https://github.com/daytona/lds/blob/master/lds/documentation/cli.md)
* [Customization](https://github.com/daytona/lds/blob/master/lds/documentation/customization.md)
* [Views & layouts](https://github.com/daytona/lds/blob/master/lds/documentation/views-layouts.md)
* [Styleguide](https://github.com/daytona/lds/blob/master/lds/documentation/styleguide.md)
* [API](https://github.com/daytona/lds/blob/master/lds/documentation/api.md)
