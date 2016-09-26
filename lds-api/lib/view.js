var findComponent = require('./find-component');
var pureQuery = require('./pure-query');

module.exports = function* view(next) {
  var query = pureQuery(this.query);
  var view = findComponent(this.lds.structure.views, '/views/' + this.params.name);

  if (query.type === 'json') {
    this.type = 'text/plain; charset=utf-8';
    this.body = view;
  } else if (query.standalone) {
    var viewtemplate = this.renderView(view, query, true);
    this.body = viewtemplate.replace(/\<\/body\>/,
      "<script>document.addEventListener('click', (event)=>{event.preventDefault();});</script>\n<\/body>"
    );
  } else if (!Object.keys(query).length){
    this.renderView(view, Object.assign({layout:'default'}, query));
  } else {
    yield next;
  }
};
