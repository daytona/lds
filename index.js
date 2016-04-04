var cmd = require('child_process');
var project = {
  'lds': require('./lds/package'),
  'lds-api': require('./lds-api/package'),
  'lds-build': require('./lds-build/package'),
  'lds-create': require('./lds-create/package'),
  'lds-editor': require('./lds-editor/package'),
  'lds-engine': require('./lds-engine/package'),
  //'lds-git': require('./lds-git/package'),
  'lds-server': require('./lds-server/package'),
  'lds-styleguide': require('./lds-styleguide/package'),
  'lds-test': require('./lds-test/package'),
  'prototype': require('./prototype/package')
};

function setup() {
  Object.keys(project).filter((folder) => {
    return project[folder].links;
  }).map((folder) => {
    cmd.exec(`cd ${folder} && npm link ${project[folder].links.join(' ')} && cd ..`, function(stdout) {
      console.log(stdout);
    });
  });
}
setup();
