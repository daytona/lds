var webshot = require('webshot');

var screenConfig = {
  thumb: {
    siteType: 'url',
    streamType: 'png',
    defaultWhiteBackground: true,
    screenSize: {
      width: 640,
      height: 480
    },
    shotSize: {
      width: 640,
      height: 480
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
  document: {
    siteType: 'url',
    streamType: 'png',
    defaultWhiteBackground: false,
    screenSize: {
      width: 800,
      height: 600
    },
    shotSize: {
      width: 800,
      height: 600
    }
  },
  component: {
    siteType: 'url',
    streamType: 'png',
    defaultWhiteBackground: true,
    captureSelector: '#Standalone-wrapper',
    screenSize: {
      width: 0
    }
  },
};
var queue = [];

function screenshot() {
  if (queue.length) {
    console.log('queue.length', queue.length);
    var job = queue.pop();
    webshot(job.url, job.dest, job.config, (err) => {
      if (err) {
        throw new Error(err);
      }
      console.log(`Screen ${job.url} saved to ${job.dest}`);
      screenshot();
    });
  }
}

function parseComponents(structure, baseUrl) {
  Object.keys(structure).forEach((componentName) => {
    var component = structure[componentName];
    var url = `${baseUrl}/api${component.id}?_screenshot=true`;
    var dest = `dist/screens${component.id}.png`
    var publicpath = `/assets/screens${component.id}.png`;
    var config;

    if (component.children) {
      parseComponents(component.children, baseUrl);
    }

    if (component.template) {
      url = url + '&_standalone=true'
      config = component.category === 'view' ? screenConfig.desktop : screenConfig.component;
    } else if (component.example) {
      url = url + '&_type=example'
      config = screenConfig.thumb;
    } else if (component.script) {
      url = url + '&_type=js'
      config = screenConfig.thumb;
    } else if (component.styles) {
      url = url + '&_type=css'
      config = screenConfig.thumb;
    } else if (component.info && !component.children) {
      url = url + '&_type=info'
      config = screenConfig.document;
    } else {
      return false;
    }

    queue.push({
      url,
      dest,
      config
    });
    component.screen = publicpath;
  });
}
function screenDump (structure, group, baseUrl) {
  if (group) {
    parseComponents(structure[group], baseUrl);
  } else {
    // parse all root categories
    Object.keys(structure).forEach((group) => {
      parseComponents(structure[group], baseUrl);
    });
  }
  screenshot();
}
module.exports = screenDump;
