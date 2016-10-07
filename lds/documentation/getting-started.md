## Getting started

Living Design System (LDS) is a tool helping you focus on whats importand in your project like GUI and content, and gives you the possibility to get up and running with a prototype really quickly.

To start a new project running LDS create a new folder and set up a brand new project.
```
$ mkdir myAwesomeProject
$ cd myAwesomeProject
$ lds init
```
This will set up a basic folder structure with base, components, modules, helpers, layouts and views. And some boiler-plate components to get you started.

To get a better understaning of the different kinds of components and their terminology lets go through them together.

### Base
This is general components and CSS utilities which are used over and over by other components and makes the base of your GUI. It's here you define components for typography, layout, color etc. and making their values available using css variables ```(:root{--variableName: value})```

### Components
Components are the reusable parts of your visible interface which can take a set of parameters and render some HTML. These are typically partials which views, layouts, modules and other components can use in their template code. These varies from a simple, icon or link to a complex carousel component witch in turn contains many many components.
LDS will automaticall parse any template code and assign it to a partial (if a partial-available language is beeing used.) with the name of ```{{> component:MyComponentName}}```

### Modules
Modules work the same way as components, but are usually a bit more complex and not as "reusable". A module can be a PageHeader which will only be used for one single purpose with the same content. The rule of thumb is, Is the component not really reusable anymore and doesnt get along with the other components. Make it a module instead.
Modules are also automaticall indexed as partials with the name of ```{{> module:MySpecificModule}}```

### Helpers
Helpers are utilities helping components become really awesome. It can some reusable piece of JavaScript which many component whished to reuse, but not a component itself. For instance like a eventListenerHelper, or some scrollBehaviour which some components might really like. It can just as well be a part of reusable template code which it self is not a component.

### Views
View are the webpages the prototype includes. Every view-component is auomatically avaoilible as route when the lds server is fired up. So my view contacts will be available under http://localhost:4000/contacts (depending on port configuration and host) Views with the name of "start" or "index" will also be available without any name, so for a startpage, create a view component called start, and view it under http://localhost:4000/.

### Layouts
Are the basic HTML document every view is using. By calling a view with a layout-paramter will look into the layouts folder for a layout component with the same name as the value of the layoutproperty. When no paramter is avaulable every view will be rendered using the "default" layout component.


## What does a component consist of then
Any component whether it is a base/component/module/helper/view or layout component is defined in a separate folder with its name for instance /MyComponent.

Inside the folder we place all the files the component is defined by. Its stylesheet (index.css), its template (index.hbs), its JavaScript (index.js), its dummydata (default.json), which will be used in the styleguide or when testing the component in standalone. And of course it documentation (readme.md) documenting the purpose of the component and how to use it.

Some components have a lot of variations and modifications as well, so to illustrate this we can add a configuraiton file (config.json) defining a schema for each data-property with examples of how to combine them. More about this in [Customisation](./customization.md).

To show how a component can be used more specifically you can also add a example file (example.hbs) where you can generate HTML describing how to use a utility, base or a component.

You can also include a screenshot of the component (screenshot.png) which will be used in the styleguide instead of the automatically taken screenshots.
