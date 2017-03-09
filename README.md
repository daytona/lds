# lds
A living design system approach, based on separate LDS node modules.

## Setup living-design-system in a new project folder

```
$ npm install -g @daytona/living-design-system
$ mkdir myNewProject && cd $_
$ lds init
$ lds start
```

## Further of development of LDS
Create symlinks to all packages to be able to reflect your changes and make sure all necessary dependencies are linked to each module. setup.js is intended to handle this for you, but depending on your setup, it might have troubles. Just open each directory and link its lds dependencies, based on it's package.json.

```
$ cd lds && npm link && cd ..
$ cd lds-api && npm link && cd ..
$ cd lds-build && npm link && cd ..
$ cd lds-cli && npm link && cd ..
$ cd lds-create && npm link && cd ..
$ cd lds-editor && npm link && cd ..
$ cd lds-engine && npm link && cd ..
$ cd lds-parser && npm link && cd ..
$ cd lds-server && npm link && cd ..
$ cd lds-styleguide && npm link && cd ..
$ cd lds-test && npm link && cd ..

$ node setup.js
```
