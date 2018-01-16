const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const fs = require('fs-extra');
const klawSync = require('klaw-sync');
const cp = require('child_process');
const rp = require('request-promise');

// Start a process and wait either for it to exit
// or to display a certain text
function startAndWait (cmd, args, options, text) {
  console.log('start startAndWait');
  return new Promise((resolve, reject) => {
    let buffer = '';

    console.log('before spawn child', cmd, args, options);
    const child = cp.spawn(cmd, args, options);
    console.log('after spawn child');
    const addToBuffer = data => {
      buffer += data;

      if (text && buffer.indexOf(text) !== -1) {
        resolve({ buffer, child });
      }
    };

    child.stdout.on('data', addToBuffer);
    child.stderr.on('data', addToBuffer);

    child.on('exit', status => {
      console.log('exit spawn child', status);
      if (status !== 0) {
        return reject(new Error(buffer));
      }

      resolve({ buffer, child });
    });
  });
}

function delay (ms) {
  return function (res) {
    return new Promise(resolve => setTimeout(() => resolve(res), ms));
  };
}

describe('scaffolding.test.js', function () {
  let appDir;

  function runGeneratedTests (expectedText) {
    return startAndWait('npm', ['test'], {cwd: appDir})
      .then(({buffer}) => {
        assert.ok(buffer.indexOf(expectedText) !== -1,
          'Ran test with text: ' + expectedText);
      });
  }

  beforeEach(() => {
    console.log('start beforeEach');
    return helpers.run(path.join(__dirname, '..', 'generators', 'all'))
      .inTmpDir(dir => {
        appDir = dir;
        fs.copySync(path.join(__dirname, 'scaffolding.test-specs.json'), path.join(`${dir}/feathers-gen-specs.json`));
      })
      .withPrompts({
        confirmation: true,
      })
      .withOptions({
        skipInstall: true
      });
  });

  it('feathers:all', () => {
    console.log('start feathers:all');
    const testName = 'scaffolding.test';

    const expectedPaths = getFileNames(path.join(__dirname, `${testName}-expected`));
    const actualPaths = getFileNames(appDir);
    assert.deepEqual(actualPaths.relativePaths, expectedPaths.relativePaths, 'Unexpected files in generated dir');

    actualPaths.paths.forEach((actualPath, i) => {
      const actual = fs.readFileSync(actualPath.path, 'utf8');
      const expected = fs.readFileSync(expectedPaths.paths[i].path, 'utf8');

      assert.equal(actual, expected, `Unexpected contents for file ${actualPaths.relativePaths[i]}`);
    });


    /*
    return runGeneratedTests('starts and shows the index page')
      .then(() => console.log('after runGeneratedTests'))
      .then(() => {
        const pkg = require(path.join(appDir, 'package.json'));

        assert.ok(pkg.devDependencies.mocha, 'Added mocha as a devDependency');
      });
    */
  });
});

function getFileNames(dir) {
  const paths = klawSync(dir, { nodir: true });

  return {
    paths: paths,
    relativePaths: paths.map(path => path.path.replace(`${dir}/`, '')).sort(),
  };
}