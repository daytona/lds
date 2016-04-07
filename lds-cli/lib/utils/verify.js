var prompt = require('prompt');
var chalk = require('chalk');

/**
 * Ask for confirmation
 * @param  {String}   question What to ask for
 * @return {Promise}
 */
function verify(question, callback) {
  // Ask for confirmation
  prompt.get({
    name: question,
    default: '[Y/n]'.grey,
    pattern: /^Y|n$/,
    message: chalk.yellow('You have to answer with "Y" (yes) or "n" (no)'),
    description: chalk.green(question),
    required: true,
    before: function (value) {
      return (value === 'Y');
    }
  }, function (err, result) {
    var canceled = (err && (err.message === 'canceled'));
    var answer = (result && result[question]);

    // Force a boolean value
    answer = (!canceled && answer);

    callback(err, answer);
  });
}

module.exports = verify;
