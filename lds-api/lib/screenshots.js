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
function parseComponents(structure) {
  Object.keys(structure).forEach((componentName) => {
    var component = lds[category][componentName];
    var url = `http://localhost:4000/api/${category}/${componentName}?screenshot=true`;
    var dest = `dist/screens${component.id}.png`
    var publicpath = `/assets/screens${component.id}.png`;
    var config;

    if (component.template) {
      url = url + '&standalone=true'
      config = component.category === 'view' ? screenConfig.desktop : screenConfig.component;
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
    if (component.children) {
      parseComponents(component.children);
    }
    screenshot(url, dest, config);
    component.screen = publicpath;
  });
}
function screenDump (structure, category) {
  if (category) {
    parseComponents(lds[category]);
  } else {
    parseComponents(lds);
  }
}
module.exports = screenDump;
