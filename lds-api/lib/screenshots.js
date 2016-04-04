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
      height: 540
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
function parseComponents(lds, category) {
  Object.keys(lds[category]).forEach((componentName) => {
    var component = lds[category][componentName];
    var url = `http://localhost:4000/api/${category}/${componentName}?screenshot=true`;
    var dest = `dist/screens/${category}/${componentName}.png`
    var publicpath = `/assets/screens/components/${componentName}.png`;
    var config;
    if (component.template) {
      url = url + '&standalone=true'
      config = screenConfig.component;
    } else if (component.example) {
      url = url + '&type=example'
      config = screenConfig.thumb;
    } else if (component.script) {
      url = url + '&type=js'
      config = screenConfig.thumb;
    } else if (component.styles) {
      url = url + '&type=css'
      config = screenConfig.thumb;
    } else {
      return false;
    }
    screenshot(url, dest, config);
    component.screen = publicpath;
  });
}
function screenDump (lds, category) {
  if(!category || category === 'views') {
    Object.keys(lds.views).forEach((viewName) => {
      var view = lds.views[viewName];
      if (view.template) {
        view.screens = {
          thumb: `/assets/screens/views/${viewName}.png`,
          mobile: `/assets/screens/views/${viewName}/mobile.png`,
          desktop: `/assets/screens/views/${viewName}/desktop.png`
        }
        screenshot(`http://localhost:4000/${viewName}`, `dist/screens/views/${viewName}/thumb.png`, screenConfig.thumb);
        screenshot(`http://localhost:4000/${viewName}`, `dist/screens/views/${viewName}/mobile.png`, screenConfig.mobile);
        screenshot(`http://localhost:4000/${viewName}`, `dist/screens/views/${viewName}/desktop.png`, screenConfig.desktop);
      }
    });
  }
  if(!category || category === 'base') {
    parseComponents(lds, 'base');
  }
  if(!category || category === 'components') {
    parseComponents(lds, 'components');
  }
  if(!category || category === 'helpers') {
    parseComponents(lds, 'helpers');
  }
  if(!category || category === 'modules') {
    parseComponents(lds, 'modules');
  }
}
module.exports = screenDump;
