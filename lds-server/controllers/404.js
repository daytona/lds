function* pageNotFound (next) {
  yield next;
  if (!this.body) {
    this.renderView();
  }
}

module.exports = pageNotFound;
