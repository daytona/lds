import path from 'path';
import fs from 'fs';
import session from '../session';

function getViewData(view) {
  const config = view.match(/styleguide:/) ? session.styleguide.config : session.config;
  const viewpath = path.join(config.path.dirname, config.path.views, view.replace(/^styleguide:/, ''));

  if (!fs.statSync(viewpath + '/index.hbs').isFile) {
    throw('No such view', view);
    return false;
  }
  const data = fs.statSync(viewpath + '/index.json').isFile ? JSON.parse(fs.readFileSync(viewpath + '/index.json', 'utf-8')) : {};
  return data;
}

function getLayoutData(layout = 'default') {
  const config = layout.match(/styleguide:/) ? session.styleguide.config : session.config;
  const layoutpath = path.join(config.path.dirname, config.path.layouts, layout.replace(/^styleguide:/, ''));

  if (!fs.statSync(layoutpath + '/index.hbs').isFile) {
    throw('No such layout', layout);
    return false;
  }
  return fs.statSync(layoutpath + '/index.json').isFile ? JSON.parse(fs.readFileSync(layoutpath + '/index.json', 'utf-8')) : {};
}

// Render a single component with request.parameters or default json.
export default function* viewPage (next) {
  let view = this.params.view || 'start';
  let viewData = getViewData(view);
  if (!viewData) {
    view = '404';
    viewData = getViewData(view);
  }

  const layoutData = getLayoutData(viewData.layout || 'default');
  const data = Object.assign({}, layoutData, viewData);
  yield this.render(view, data);
}
