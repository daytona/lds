var objectDeepMap = require('./object-deep-map');

function findComponent(structure, id) {
  var component;
  // Pass conditional function as second paramter to match other than id
  var callback = typeof id === 'function' ? id : function(value) {
    return value.id === id;
  }

  objectDeepMap(structure, (value) => {
    if (value && value.isLDSObject && callback(value)) {
      component = value;
    }
    return value;
  });
  return component;
}
module.exports = findComponent;
