function* pageNotFound (next) {
  yield next;
  if (!this.body) {
    this.lds.renderView();
  }
}

module.exports = pageNotFound;
