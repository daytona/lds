module.exports = (function() {
  var sessionsData = {};

  return {
    get: function(param){
      return sessionsData[param];
    },
    set: function(param, value){
      return sessionsData[param] = value;
    }
  }
}());
