var findComponent = require('./find-component');
var pureQuery = require('./pure-query');
var handlebars = require('handlebars');
var updateIframeScript = require('./updateIframeHeightScript');
var templates = require('./templates');
var marked = require('marked');

module.exports = function* component (next) {
  var component = findComponent(this.lds.structure, '/'+ this.params.path);

  if (!component) {
    return false;
  }
  var query = pureQuery(this.query);

  if (query.type === 'json' || query.type === 'js' || query.type === 'css' || query.type === 'template' || query.type === 'html') {
    var content;
    var language = query.type;
    switch (query.type) {
      case 'json':
        content = JSON.stringify(component.data, null, 2);
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
        content = this.render(component.template, Object.assign({}, component.data, query));
        language = 'html';
        break;
    }
    if (query.clean) {
      this.type = 'text/plain; charset=utf-8';
      this.body = content;
      return;
    }
    this.body = handlebars.compile(templates['code.hbs'])({
      query,
      language,
      content
    });
  } else if (query.type === 'info') {
    this.body = handlebars.compile(templates['info.hbs'])({
      info: marked(component.info)
    });
  } else if (query.type === 'example') {
    this.body = handlebars.compile(templates['example.hbs'])({
      example: this.render(component.example, Object.assign({}, component, query)),
      updateHeightScript: query.iframeid && updateIframeScript(query.iframeid)
    });
  } else if (query.standalone) {
    this.body = handlebars.compile(templates['standalone.hbs'])({
      isComponent: component.category === 'component',
      content: this.render(component.template, Object.assign({}, component.data, query)),
      updateIframeScript: updateIframeScript(query.iframeid)
    });
  } else if (!Object.keys(query).length) {
    this.body = this.render(component.template, Object.assign({}, component.data, query));
  } else {
    yield next;
  }
}
