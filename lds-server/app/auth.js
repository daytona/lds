var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');

module.exports = function auth(login, token) {
  return function* (next) {
    var params = this.request.body;

    if (params && params.lds_username == login.name && params.lds_password === login.pass) {
      this.session.token = token;
      this.redirect(this.request.url);
    }

    if (this.session.token === token) {
      yield next;
    } else {
      var view = fs.readFileSync(path.resolve(__dirname, '../views/login.hbs'), 'utf8');
      this.body = handlebars.compile(view)(params);
      return;
    }
  }
}
