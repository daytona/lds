# Living Design System

NPM root package for managing a living design system of UI-components, views and data.

## Installation

Install lds by installing lds as global dependency

$ npm install @daytona/living-design-system

Create a new folder for your project and run command

$ lds init

This sets up a folder structure (which you can change) and a config file (lds.config.js) with all the paths and configurations of your project, and a simple example component.

To start up the server run command

$ lds start

This builds your assets, creating a watch task for file changes in your project and starts up a KOA.js server with routes for all your views and for a separate styleguide presenting your components and views, as well as a API, with commands to manage you design system.
