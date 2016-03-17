var webshot = require('webshot');

var screenConfig = {
  thumb: {
    siteType: 'url',
    streamType: 'png',
    defaultWhiteBackground: true,
    screenSize: {
      width: 320,
      height: 320
    },
    shotSize: {
      width: 320,
      height: 320
    }
  },
  mobile: {
    siteType: 'url',
    streamType: 'png',
    defaultWhiteBackground: true,
    screenSize: {
      width: 320,
      height: 480
    },
    shotSize: {
      width: 'all',
      height: 'all'
    }
  },
  desktop: {
    siteType: 'url',
    streamType: 'png',
    defaultWhiteBackground: true,
    screenSize: {
      width: 960,
      height: 400
    },
    shotSize: {
      width: 'all',
      height: 'all'
    }
  },
  component: {
    siteType: 'url',
    streamType: 'png',
    defaultWhiteBackground: true,
    captureSelector: '#Standalone-wrapper',
    screenSize: {
      width: 0
    },
  },
};
function screenshot(url, path, config) {
  webshot(url, path, config, (err) => {
    if (err) {
      throw new Error(err);
    }
    console.log(`Screen ${url} saved to ${path}`);
  });
}
function screenDump (lds) {
  Object.keys(lds.views).forEach((viewName) => {
    var view = lds.views[viewName];
    if (view.template) {
      view.screens = {
        thumb: `/assets/screens/views/${viewName}/thumb.png`,
        mobile: `/assets/screens/views/${viewName}/mobile.png`,
        desktop: `/assets/screens/views/${viewName}/desktop.png`
      }
      screenshot(`http://localhost:4000/${viewName}`, `dist/screens/views/${viewName}/thumb.png`, screenConfig.thumb);
      screenshot(`http://localhost:4000/${viewName}`, `dist/screens/views/${viewName}/mobile.png`, screenConfig.mobile);
      screenshot(`http://localhost:4000/${viewName}`, `dist/screens/views/${viewName}/desktop.png`, screenConfig.desktop);
    }
  });
  Object.keys(lds.components).forEach((componentName) => {
    var component = lds.components[componentName];
    if (component.template) {
      var screens = `/assets/screens/components/${componentName}.png`;

      screenshot(`http://localhost:4000/api/components/${componentName}?standalone=true`, `dist/screens/${component.group}/${componentName}.png`, screenConfig.component);
      lds.components[componentName].screen = screens;
    }
  });
}
module.exports = screenDump;
