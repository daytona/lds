function* pageNotFound (next) {
  yield next;
  if (!this.body) {
    this.body = 'The page you are looking for could not be found';
    //this.lds.renderView();
  }
}

module.exports = pageNotFound;
