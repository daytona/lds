var sessions = {};

module.exports = {
  get: function(param){
    return sessions[param];
  },
  set: function(param, value){
    return sessions[param] = value;
  }
}
