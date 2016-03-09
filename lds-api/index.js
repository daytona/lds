var server = require('lds-server');
var build = require('lds-build');
var test = require('lds-test');
var styleguide = require('lds-test');

var methods = {
  init() {
    // Set up a new LDS structure installing dependencies, creating folders, and lds.config
  },
  start() {
    // Start server, or if server is already running, restart
  },
  test(which) {
    // Run test suite to make sure everyting is A-OK.
  },
  create(type) {
    // Create a new component/base/module/view
  },
  build(task) {
    // Build
  },
  update(object) {
    // write updated data object to disk
  },
  remove(object) {
    // delete component from file structure
  },
  bump(object, change='minor') {
    // update semver version of object
  },
  diff(commit1, commit2) {
    // Get a diff view
  },
  pull() {
    // Pull latest changes
  },
  commit(message) {
    // Check in changes in branch and update pull request
  },
  pullRequest() {
    // Create a new Pull request for all changes made to LDS through the service
  }
};

var api = {
  get : {
    'api/:category/:name' : function(options){
      // Get default component with default data, rendered as type: html, as json object as type: json
    }
  },
  post: {
    'api/:category/:name' : function(data){
      // Modify component with passed parameters and return component as html or json depending on type
    }
  },
  put: {
    'api/:category/:name' : function(data){
      // Modify component data and write changes to file and bump component version
      // Or if component not existing, create new component
    }
  },
  delete: {
    'api/:category/:name' : function(data){
      // Delete component from file structure, require authentication
    }
  },
};
module.exports = api;
