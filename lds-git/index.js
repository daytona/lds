/*
  Connect with LDS Git repository allowing for diff, branch, commit and pull request
*/

var Git = require("nodegit");
var path = require('path');

module.exports = function git(config) {
  var master;
  var currentBranch;

  function clone(repo, dest) {
    Git.Clone(url, dest)
      .then(function(repo) {
        console.log('repository', url, 'successfully cloned to', dest);
      })
      .catch(function(err) {
        console.log(err);
      });
  }
  function pull() {
    Git.open(config.path.dirname)
      .then(function(repo) {
        repo.getMasterCommit()
      });
  }
  function rebase(branch) {
    Git.open(config.path.dirname)
      .then(function(repo) {
        return Rebase.init(repo, branch, upstream, onto, opts)
      .then(function(rebase) {
        // Use rebase
      })
      .done(function() {
        console.log();
      })
  }
  function getHistoryOf(folder) {
    
  }

}
