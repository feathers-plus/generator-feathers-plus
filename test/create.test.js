const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const fs = require('fs-extra');
const klawSync = require('klaw-sync');
const cp = require('child_process');
const rp = require('request-promise');

const { resetForTest: resetSpecs } = require('../lib/specs');

const packageInstaller = 'npm'; // npm measured as faster than yarn for this
const tests = [
  // t1, z1 Test creation of app scaffolding.
  //  generate app            # z-1, Project z-1, npm, src1, socketio (only)
    'app.test',
  // t2, z2 (z1 ->) Test service creation without authentication scaffolding.
  //* generate app            # z-1, Project z-1, npm, src1, socketio (only)
  //  generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth N, graphql Y
  //  generate service        # NeDB, nedb2, /nedb-2,                 auth N, graphql Y
    'service.test',
  // t3,z3 (z2 ->) Test middleware creation.
  //* generate app            # z-1, Project z-1, npm, src1, socketio (only)
  //* generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth N, graphql Y
  //* generate service        # NeDB, nedb2, /nedb-2,                 auth N, graphql Y
  //  generate middleware     # mw1, *
  //  generate middleware     # mw2, mw2
    'middleware.test',
  // t4, z4 (z2 ->) Test graphql endpoint creation.
  //* generate app            # z-1, Project z-1, npm, src1, socketio (only)
  //* generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth N, graphql Y
  //* generate service        # NeDB, nedb2, /nedb-2,                 auth N, graphql Y
  //  Add schemas for nedb1 and nedb2
  //  Regenerate nedb1 and nedb2
  //  generate graphql        # service calls, /graphql,
    'graphql.test',
  // t5, z5 Test authentication scaffolding.
  //  generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //  generate authentication # Local and Auth0, users1, Nedb, nedb://../data, graphql Y
    'authentication-1.test',
  // t6, z6 (z5 ->) Test creation of authenticated service with auth scaffolding.
  //* generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //* generate authentication # Local and Auth0, users1, Nedb, nedb://../data, graphql Y
  //  generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth Y, graphql Y
    'authentication-2.test',
  // t7, z7 (z6 ->) Test creation of non-authenticated service with auth scaffolding.
  //* generate app            # z-1, Project z-1, npm, src1, REST and socketio
  //* generate authentication # Local and Auth0, users1, Nedb, nedb://../data, graphql Y
  //* generate service        # NeDB, nedb1, /nedb-1, nedb://../data, auth Y, graphql Y
  //  generate service        # NeDB, nedb2, /nedb-2, nedb://../data, auth N, graphql Y
    'authentication-2.test',
];

let appDir;

function delay (ms) {
  return function (res) {
    return new Promise(resolve => setTimeout(() => resolve(res), ms));
  };
}

describe('create.test.js', function () {
  tests.forEach(testName => {

    describe(testName, function () {
      it('writes code expected', () => {
        return configureGenerator(testName, { skipInstall: true })
          .then(dir => {
            compareCode(dir, `${testName}-expected`);
          });
      });

      it('runs test generated', () => {
        return configureGenerator(testName, { skipInstall: false })
          .then(dir => {
            return runGeneratedTests('starts and shows the index page')
              .then(() => {
                const pkg = require(path.join(dir, 'package.json'));

                assert.ok(pkg.devDependencies.mocha, 'Added mocha as a devDependency');
              });
          });
      });
    });

  });
});

// Configure the yeoman test generator
function configureGenerator(testName, withOptions) {
  return helpers.run(path.join(__dirname, '..', 'generators', 'all'))
    .inTmpDir(dir => {
      appDir = dir;
      // specs.app.name must be 'z-1' not 'z1' as Feathers-generate app converts the project name
      // to kebab-case during the prompt.
      fs.copySync(path.join(__dirname, `${testName}-copy`), dir);

      resetSpecs();
    })
    .withPrompts({
      confirmation: true,
      action: 'force', // force file overwrites
    })
    .withOptions(withOptions);
}

// Run the 'test' script in package.json
function runGeneratedTests (expectedText) {
  return runCommand(packageInstaller, ['test'], { cwd: appDir })
    .then(({ buffer }) => {
      assert.ok(buffer.indexOf(expectedText) !== -1,
        'Ran test with text: ' + expectedText);
    });
}

// Start a process and wait either for it to exit
// or to display a certain text
function runCommand (cmd, args, options, text) {
  return new Promise((resolve, reject) => {
    let buffer = '';

    function addToBuffer(data) {
      buffer += data;

      if (text && buffer.indexOf(text) !== -1) {
        resolve({ buffer, child });
      }
    }

    const child = cp.spawn(cmd, args, options);

    child.stdout.on('data', addToBuffer);
    child.stderr.on('data', addToBuffer);

    child.on('exit', status => {
      if (status !== 0) {
        return reject(new Error(buffer));
      }

      resolve({ buffer, child });
    });
  });
}

function compareCode(appDir, testDir) {
  const expectedPaths = getFileNames(path.join(__dirname, testDir));
  const actualPaths = getFileNames(appDir);
  assert.deepEqual(actualPaths.relativePaths, expectedPaths.relativePaths, 'Unexpected files in generated dir');

  actualPaths.paths.forEach((actualPath, i) => {
    const actual = fs.readFileSync(actualPath.path, 'utf8');
    const expected = fs.readFileSync(expectedPaths.paths[i].path, 'utf8');

    assert.equal(actual, expected, `Unexpected contents for file ${actualPaths.relativePaths[i]}`);
  });
}

function getFileNames(dir) {
  const paths = klawSync(dir, { nodir: true });

  return {
    paths: paths,
    relativePaths: paths.map(path => path.path.replace(`${dir}/`, '')).sort(),
  };
}