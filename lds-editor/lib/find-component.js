var objectDeepMap = require('./object-deep-map');

function findComponent(structure, val, param) {
  param = param || 'id';
  var component;
  objectDeepMap(structure, (value) => {
    if (value && value.isLDSObject && value[param] === encodeURI(val)) {
      component = value;
    }
    return value;
  });
  return component;
}
module.exports = findComponent;
