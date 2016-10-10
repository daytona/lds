var Imagemin = require('imagemin');

module.exports = function buildImages(src, dest, callback) {
  new Imagemin()
  	.src(src + '/*.{gif,jpg,png,svg}')
  	.dest(dest)
  	.use(Imagemin.jpegtran({progressive: true}))
  	.run(function (err, files) {
      if (err) {
        console.error(err);
        return;
      }
  		if (typeof callback === 'function') {
        callback(files);
      }
  		// => {path: 'build/images/foo.jpg', contents: <Buffer 89 50 4e ...>}
  	});
}
