## Command Line
The command line is the developers best friend and using the LDS command line utilities you can control the running, building, testing and initialization of your project.

To use the lds cli commands the easiest way is installing @daytona/living-design-system as a global dependency

```
$ npm install -g @daytona/living-design-system
```

You can also install i locally and exending the commands in package.json as npm scripts
```
script: {
  "start": "lds start",
  "build": "lds build",
  "watch": "lds watch",
  ...
}

```
Then by running ```$ npm run start``` will automatically look into your node_modules folder and run the locally installed version of living-design-system.


The command available in lds-cli includes:
```
$ lds init
// Creates a new LDS project initializing a folder structure, config file and package.json

$ lds start       
// Start up the HTTP server, running the views as separate routes and also fireing up the  API and the styleguide

$ lds build
// Running the build script bundling your assets to the dist folder.
// Also available for specific typ eg. $ lds build script

$ lds watch
// Start up the server and wait for any change in assetfiles and run appropriate build automatically (might not take into considaration the creation of new components).

$ lds test
// TODO: Make sure your LDS-structure is correct and working.

$ lds create component MyName
// creates a new component with the name of MyName. Also available for (base, module, view, helper and layout)
