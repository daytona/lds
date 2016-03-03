var config = require('./lds.config');

function parseData(session) {
  // Parse styleguide data to fit the components using it.
  var data = {};

  if (session.lds.base) {
    data.base = session.lds.base;
  }
  if (session.lds.components) {
    data.components = session.lds.components;
  }
  if (session.lds.modules) {
    data.modules = session.lds.modules;
  }
  if (session.lds.views) {
    data.views = session.lds.views;
  }

  data.mainNav = mainNav(data);

  if (session.styleguide.config.prefix) {
    data.prefix = session.styleguide.config.prefix + '-';
  }
  return data;
}


function mainNav(data) {
  return {
    items: Object.keys(data).map((groupName) => {
      var group = data[groupName];
      return {
        name: groupName,
        url: `/styleguide/${groupName}`,
        items: Object.keys(data[groupName]).map((compName) => {
          var component = group[compName];
          return {
            name: component.name,
            url: `/styleguide/${groupName}/${compName}`,
          };
        })
      };
    })
  };
}

module.exports = {
  config,
  parseData
};
