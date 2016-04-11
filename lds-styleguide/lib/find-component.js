var objectDeepMap = require('./object-deep-map');

function findComponent(structure, id) {
  var component;
  objectDeepMap(structure, (value) => {
    if (value && value.isLDSObject && value.id === encodeURI(id)) {
      component = value;
    }
    return value;
  });
  return component;
}
module.exports = findComponent;
