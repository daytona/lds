module.exports = function auth(login, token) {
  return function* (next) {
    var params = this.request.body;

    if (params && params.lds_username == login.name && params.lds_password === login.pass) {
      this.session.token = token;
    }

    if(this.session.token === token) {
      yield next;
    } else {
      this.body = `
      <form action="/" method="post">
        <h1>Logga in</h1>
        <label for="lds_username">Användarnamn</label>
        <input id="lds_username" type="text" name="lds_username" value="${params.lds_username || ''}"/>
        <br />
        <label for="lds_password">Lösenord</label>
        <input id="lds_password" type="password" name="lds_password" />
        <br />
        <button type="submit">Logga in</button>
      </form>`;
      return;
    }
  }
}
