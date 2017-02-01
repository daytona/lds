var findComponent = require('../lib/find-component');
var pureQuery = require('../lib/pure-query');
var objectDeepMap = require('../lib/object-deep-map');
var Engine = require('@daytona/lds-engine');

module.exports = function* view(next) {
  // parse view data and get all partials using a config.schema and render the forms for each component.
  // When all editors are present, call view, as api call in an iframe.
  // Which of course can be resized for mobile etc.

  yield next;
  var viewComponent = findComponent(this.lds.structure.views, '/views/'+ this.params.path);

  if (!viewComponent || (!viewComponent.template && viewComponent.children)) {
    viewComponent = findComponent(this.lds.structure.views, '/views' + (this.params.path || '') + '/index') ||
                    findComponent(this.lds.structure.views, '/views' + (this.params.path || '') + '/start');
  }
  if (!viewComponent) {
    return false;
  }
  var query = pureQuery(this.query);

  // Copy view.data
  var viewData = Object.assign({}, viewComponent.data);

  // Update viewData with __objectPath, to know what path is used for each partial
  // objectDeepMap(viewData, (value, key, path) => {
  //   // Is value an object
  //   if (value === Object(value)) {
  //     value.__objectPath = path.length ? path + '.' + key : key;
  //   }
  //   return value;
  // });

  // var partialList = [];
  // // Parse this.lds.strucute and registerPartial and update template {{> component:name}} -> {{>LDScomponent:name}}
  // objectDeepMap(this.lds.structure, value => {
  //   if (value && value.isLDSObject) {
  //     //console.log(value.name);
  //     if (value.template && value.partialName && value.config && value.config.schema) {
  //       var component = value;
  //       ldsEngine.registerPartial(component.partialName, function(){
  //         partialList.push({
  //           name: component.partialName,
  //           schema: component.config.schema,
  //           data: this,
  //           dataPath: this.__objectPath
  //         });
  //       });
  //     }
  //   }
  //   return value;
  // });
  var renderedEditModeView = this.lds.renderView(viewComponent, {layout: false, editmode:true}, true, true);
  var partialCommentRegExp = new RegExp('<!-- component=\"([^\"]*)\" id=\"([^\"]*)\" data=\"([^\"]*)\" -->', 'g');
  var partialComments = renderedEditModeView.match(partialCommentRegExp);
  var partials = [];

  if (partialComments) {
    var componentRegExp = new RegExp('component=\"([^\"]*)\"');
    var idRegExp = new RegExp('id=\"([^\"]*)\"');
    var dataRegExp = new RegExp('data=\"([^\"]*)\"');

    partialComments.map(partialComment => {
      var partialString = partialComment.match(componentRegExp)[1];
      var id = partialComment.match(idRegExp)[1];
      var dataString = partialComment.match(dataRegExp)[1];
      var data = JSON.parse(dataString.replace(/&quot;/g, '"'));
      var component = findComponent(this.lds.structure, partialString, 'partialName');

      if (component) {
        partials.push({
          id,
          partialName: partialString,
          dataPath: data.__objectPath || '',
          data,
          schema: component.config.schema,
          component
        });
      }
    });
  }

  // read data and render a editForm based on component schema

  var html = this.editor.renderView(this.editor.structure.views.view, {view: viewComponent, data: viewData, partials}, true);
  this.body = html;
  return;
}
