var mocha = require('mocha');

module.exports = function test(type, root) {
  var config;

  describe('LDS', function() {
    describe('#isLDS', function() {

      it('should have a config file', function() {
        fs.fstatSync(path.join(root, 'lds.config.js')).isFile().should.equal(true);
      });

      config = require(path.join(process.cwd(), 'lds.config.js'));

      it('should be a valid config file', function() {
        typeof(config).should.equal('object');
      });

    });
  });

}
/**
 * Tests to expect
 * : is process.cwd() a lds directory
 * : lds-config.js exists and needed properties
 * : Non empty default.json
 * : Each path in config needs to exist
 * : Test Templating engine
 * : ...
 */
