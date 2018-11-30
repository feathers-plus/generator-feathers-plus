
const chalk = require('chalk');
const Generator = require('yeoman-generator');
const path = require('path');
const semver = require('semver');
const validateNpmPackageName = require('validate-npm-package-name');
const { cwd } = require('process');
const { kebabCase } = require('lodash');
const { parse } = require('path');
const { platform, release } = require('os');
const { setPath } = require('./specs');

const appSpecsFile = 'feathers-gen-specs.json';
const currGeneratorVer = '1.0.0';

// Keep a list, shared among all generators, of all dependencies still required
const dependenciesList = {
  prod: [],
  dev: [],
};

module.exports = class BaseGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);

    if (parse(process.cwd()).base === 'generator-feathers-plus') {
      this.log.error('Cannot generate code within the generator-feathers-plus.');
      process.exit(1);
    }

    if (!semver.satisfies(process.version, '>= 10.0.0')) {
      this.log.error('The generator is only tested to work with Node v10.0.0 and up!');
    }

    this._opts = opts;
    this.generatorPkg = this.fs.readJSON(path.join(__dirname, '..', 'package.json'));
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = opts.props || {};

    this.dependenciesList = dependenciesList;
  }

  static async asyncInit (generator) {
    /*
     'this._specs = setPath(...)' returns setPath's 'stashedSpecs' object, which is static.
     Therefore setPath, the initial generator and any generators started by 'composeWith'
     share the same object. They all 'see' any mutations made by the others.
     */
    generator._specs = await setPath(generator);
  }

  getNameSpace(subFolder = '', ifConvert) {
    subFolder = subFolder.trim();


    if (subFolder === '') {
      return ['', [], ''];
    }

    const parts = subFolder.split('/').map(
      part => ifConvert ? makeFileName(part) : part
    );

    if (subFolder.substr(-1) === '/') {
      parts.pop();
    }

    // ['a/b/c', ['a','b','c'], '../../../'] Last elem backs up to root of subFolder.
    return [`${parts.join('/')}/`, parts, '../'.repeat(parts.length)];
  }

  makeFilePath(path) {
    const str = this.getNameSpace(path, true)[0];
    return str.substring(0, str.length - 1);
  }

  makeFileName (name) {
    return makeFileName(name);
  }

  checkDirContainsApp () {
    const specs = this.fs.readJSON(this.destinationPath(appSpecsFile), null);

    if (!specs) {
      this.log.error(
        chalk.green.bold('Dir ') +
        chalk.yellow.bold(parse(cwd()).base) +
        chalk.green.bold(' does not contain an app created by this generator.'));
      return process.exit(1);
    }

    if (typeof specs !== 'object' || specs === null || !specs.options || !specs.options.ver) {
      this.log.error(
        chalk.green.bold('File ') +
        chalk.yellow.bold(appSpecsFile) +
        chalk.green.bold(' in dir ') +
        chalk.yellow.bold(parse(cwd()).base) +
        chalk.green.bold(' is corrupted.'));
      return process.exit(1);
    }

    if (specs.options.ver !== currGeneratorVer) {
      this.log.error(
        chalk.green.bold('The app in dir ') +
        chalk.yellow.bold(parse(cwd()).base) +
        chalk.green.bold(' was generated with generator version ') +
        chalk.yellow.bold(specs.options.ver));
      this.log.error(
        chalk.green.bold('It must be upgraded to version ') +
        chalk.yellow.bold(currGeneratorVer) +
        chalk.green.bold(' before using this generator.'));
      return process.exit(1);
    }
  }

  get libDirectory () {
    return this.pkg.directories && this.pkg.directories.lib;
  }

  get testDirectory () {
    return (this.pkg.directories && this.pkg.directories.test) || 'test';
  }

  _packagerInstall (deps, options) {
    const packager = this.pkg.engines && this.pkg.engines.yarn ? 'yarn' : 'npm';
    const method = `${packager}Install`;
    const isDev = options.saveDev;

    // Ignore dependencies already installed
    const existingDependencies = this.pkg[isDev ? 'devDependencies' : 'dependencies'] || {};
    const dependencies = deps.filter(current => !existingDependencies[current])
      // Make sure that only dependencies in the expected version ranges are being installed
      // so that breaking changes will not break the generated application.
      .map(dependency => {
        const version = this.generatorPkg.generatedSemvers[dependency];

        if(!version) {
          this.log(`No locked version found for ${dependency}, installing latest.`);

          return dependency;
        }

        return `${dependency}@${version}`;
      });

    // Keep a list of all dependencies required
    if (isDev) {
      dependenciesList.dev = dependenciesList.dev.concat(dependencies);
    } else {
      dependenciesList.prod = dependenciesList.prod.concat(dependencies);
    }

    // Schedule dependencies for installation
    // Dependencies for `generate all` are scheduled in generators/all/index.js for a faster install
    if (this._specs._generators.indexOf('all') === -1 && dependencies.length) {
      if (packager === 'yarn' && isDev) {
        options.dev = true;
        delete options.saveDev;
      }

      this[method](dependencies, options);
    }
  }

  callWritingFromPrompting() {
    // https://stackoverflow.com/questions/9044315/get-the-node-js-version-at-runtime
    // console.log(os.type()); // "Windows_NT"
    // console.log(os.release()); // "10.0.14393"
    // console.log(os.platform()); // "win32"
    return false;

    const ifWin10 = platform().toLowerCase().includes('win') && release().substr(0, 3) === '10.';
    const ifNode10 = process.version.substr(0, 4) === 'v10.';
    const ifNeedHack = ifWin10 && ifNode10;

    if (ifWin10) {
      console.log('os.release=', release());
      console.log('os.platform=', platform());
      console.log('process.version=', process.version);
      console.log('need to avoid hang=', ifNeedHack);
    }

    return ifNeedHack;
  }
};

function makeFileName (name) {
  return validateNpmPackageName(name).validForNewPackages ? name : kebabCase(name);
}
