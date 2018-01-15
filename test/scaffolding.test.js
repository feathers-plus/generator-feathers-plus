const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const cp = require('child_process');
const rp = require('request-promise');

// Start a process and wait either for it to exit
// or to display a certain text
function startAndWait(cmd, args, options, text) {
  return new Promise((resolve, reject) => {
    let buffer = '';

    const child = cp.spawn(cmd, args, options);
    const addToBuffer = data => {
      buffer += data;

      if(text && buffer.indexOf(text) !== -1) {
        resolve({ buffer, child });
      }
    };

    child.stdout.on('data', addToBuffer);
    child.stderr.on('data', addToBuffer);

    child.on('exit', status => {
      if(status !== 0) {
        return reject(new Error(buffer));
      }

      resolve({ buffer, child });
    });
  });
}

function delay(ms) {
  return function(res) {
    return new Promise(resolve => setTimeout(() => resolve(res), ms));
  };
}


describe('scaffolding.test.js', function() {
  let appDir;

  function runTest (expectedText) {
    return startAndWait('yarn', ['test'], {cwd: appDir})
      .then(({buffer}) => {
        assert.ok(buffer.indexOf(expectedText) !== -1,
          'Ran test with text: ' + expectedText);
      });
  }

  beforeEach(() => helpers.run(path.join(__dirname, '..', 'generators', 'app'))
    .inTmpDir(dir => (appDir = dir))
    .withPrompts({
      name: 'myapp',
      providers: ['rest', 'socketio'],
      src: 'src',
      packager: 'npm@>= 3.0.0'
    })
    .withOptions({
      skipInstall: false
    })
  );

  it('feathers:app', () =>
    runTest('starts and shows the index page').then(() => {
      const pkg = require(path.join(appDir, 'package.json'));

      assert.ok(pkg.devDependencies.mocha, 'Added mocha as a devDependency');
    })
  );
});
