export default {
  version: '0.0.1',
  prefix: 'lds',
  path : {
    dirname: __dirname,
    base: 'src/base',
    components: 'src/components',
    views: 'src/views',
    layouts: 'src/views/_layouts',
    dist: 'dist',
    public: '/styleguide',
    icons: 'src/assets/icons',
    fonts: 'src/assets/fonts',
    images: 'src/assets/images'
  },
  dest: {
    script: 'main.js',
    style: 'style.css',
    images: 'images',
    fonts: 'fonts'
  },
  helpers: {}
};
