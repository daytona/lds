import path from 'path';
import trace from './trace';
import build from './build';

export default function generate(name, ...args) {
  const tree = trace(path.join(__dirname, 'generators', 'default'));
  const component = {};
  const data = {name};
  if (args.indexOf('-js') > 0) {
    data.script = true;
    component[name]['index.js'] = Handlebars.compile(tree['index.js'], {preventIndent: true})(data);
  }
  component[name] = {
    'index.hbs': Handlebars.compile(tree['index.hbs'])(data),
    'default.json': Handlebars.compile(tree['default.json'])(data),
    'index.css': Handlebars.compile(tree['index.css'])(data),
    'readme.md': Handlebars.compile(tree['readme.md'])(data),
  };

  build(component, directory + '/src/components/');
}
if (process.argv && process.argv.length > 2) {
  generate.apply(null, process.argv.slice(2));
}
