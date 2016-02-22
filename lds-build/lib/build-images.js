var Imagemin = require('imagemin');

module.exports = function buildImages(src, dest) {
  new Imagemin()
  	.src(src + '/*.{gif,jpg,png,svg}')
  	.dest(dest)
  	.use(Imagemin.jpegtran({progressive: true}))
  	.run(function (err, files) {
  		console.log(files[0]);
  		// => {path: 'build/images/foo.jpg', contents: <Buffer 89 50 4e ...>}
  	});
}
