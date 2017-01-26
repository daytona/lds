var findComponent = require('./find-component');
var pureQuery = require('./pure-query');
var handlebars = require('handlebars');
var updateIframeScript = require('./updateIframeHeightScript');
var socketScript = require('./socketScript');
var templates = require('./templates');
var marked = require('marked');
var sessions = require('./session');

module.exports = function* component (next) {
  yield next;
  var component = findComponent(this.lds.structure, '/'+ this.params.path);

  if (!component) {
    return false;
  }
  var query = pureQuery(this.query);
  var variationData = query.variation && component.config && component.config.variations && component.config.variations[query.variation] && component.config.variations[query.variation].value ? component.config.variations[query.variation].value : {};

  var componentData = Object.assign({}, component.data, variationData);
  // If components is updated in a separate session override component with that data
  if (query._session && sessions.get(query._session)) {
     var sessionData = sessions.get(query._session).data;
     Object.assign(componentData, sessionData);
  }

  if (query._type === 'json' || query._type === 'js' || query._type === 'css' || query._type === 'template' || query._type === 'html') {
    var content;
    var language = query._type;
    switch (query._type) {
      case 'json':
        content = JSON.stringify(componentData, null, 2);
        break;
      case 'js':
        content = component.code.script;
        break;
      case 'css':
        content = component.code.styles;
        break;
      case 'template':
        content = component.code.template;
        language = 'handlebars';
        break;
      case 'html':
        content = this.render(component.template, Object.assign({}, componentData, query));
        language = 'html';
        break;
    }
    if (query._clean) {
      this.type = 'text/plain; charset=utf-8';
      this.body = content;
      return;
    }
    this.body = handlebars.compile(templates['code.hbs'])({
      query,
      language,
      content
    });
  } else if (query._type === 'info') {
    this.body = handlebars.compile(templates['info.hbs'])({
      info: marked(component.info)
    });
  } else if (query._type === 'example') {
    this.body = handlebars.compile(templates['example.hbs'])({
      example: this.render(component.example, Object.assign({}, component, query)),
      updateHeightScript: query._iframeid && updateIframeScript(query._iframeid),
      socketScript: socketScript((this.request.protocol.match(/https/) ? 'wss' : 'ws') +'://' + this.request.host)
    });
  } else if (query._standalone) {
    this.body = handlebars.compile(templates['standalone.hbs'])({
      isComponent: component.category === 'component',
      config: component.config,
      content: this.render(component.template, Object.assign({}, componentData, query)),
      updateIframeScript: updateIframeScript(query._iframeid),
      socketScript: socketScript((this.request.protocol.match(/https/) ? 'wss' : 'ws') +'://' + this.request.host)
    });
  } else if (component.category === 'view') {
    this.renderView(component, Object.assign({layout:'default'}, (sessionData || {}), query));
  } else {
    this.body = this.render(component.template, Object.assign({}, componentData, query));
  }
}
