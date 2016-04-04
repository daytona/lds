/*
  Connect with LDS Git repository allowing for diff, branch, commit and pull request
*/

var GitHubApi = require("github"); //https://github.com/mikedeboer/node-github
var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    timeout: 5000,
    headers: {
        "user-agent": "My-Cool-GitHub-App" // GitHub is happy with a unique user agent
    }
});
function login() {
  github.authenticate({
    type: "oauth",
    key: "clientID",
    secret: "clientSecret"
  });
  github.authorization.create({
    scopes: ["user", "public_repo", "repo", "repo:status", "gist"],
    note: "what this auth is for",
    note_url: "http://url-to-this-auth-app",
    headers: {
        "X-GitHub-OTP": "two-factor-code"
    }
}, function(err, res) {
    if (res.token) {
        //save and use res.token as in the Oauth process above from now on
    }
});
}
function commit(message) {
  // Commit changes to stage
}
function diff(version) {
  // Get a complete diff from head / origin or specific version
}
function checkout(version) {
  // Change version of LDS
}
function pull(commit) {
  // Get a fresh pull from origin
}
function branch(name) {
  // move into a separate branch
}
function pullRequest(name) {
  // create pull request or update pull request with current changes
}

github.user.getFollowingFromUser({
    // optional:
    // headers: {
    //     "cookie": "blahblah"
    // },
    user: "lds-styleguide"
}, function(err, res) {
    console.log(JSON.stringify(res));
});

module.exports = {}
