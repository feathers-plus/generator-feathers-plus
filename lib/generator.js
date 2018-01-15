
const chalk = require('chalk');
const Generator = require('yeoman-generator');
const semver = require('semver');
const _ = require('lodash');
const { cwd } = require('process');
const { parse } = require('path');
const { setPath } = require('./specs');

const appSpecsFile = 'feathers-gen-specs.json';
const currGeneratorVer = '1.0.0';

module.exports = class BaseGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    if(process.version < 'v6.0.0') {
      this.log.error('The generator is only tested to work with Node v6.0.0 and up!');
    }

    /*
     'this._specs = setPath(...)' returns setPath's 'stashedSpecs' object, which is static.
     Therefore setPath, the initial generator and any generators started by 'composeWith'
     share the same object. They all 'see' any mutations made by the others.
     */
    this._specs = setPath(this, this.destinationPath(appSpecsFile))
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    this.props = opts.props || {};
    this.defaultConfig = this.fs.readJSON(this.destinationPath('config', 'default.json'), {});

    // debugging options
    this.logSteps = false; // controls logging of start/end of generators' steps
    this.conflicter.force = false; // force mutating overrides without user options
  }

  checkDirContainsApp() {
    const specs = this.fs.readJSON(this.destinationPath(appSpecsFile), null);

    if (!specs) {
      this.log.error(
        chalk.green.bold('Dir ')
        + chalk.yellow.bold(parse(cwd()).base)
        + chalk.green.bold(' does not contain an app created by this generator.'));
      return process.exit(1);
    }

    if (typeof specs !== 'object' || specs === null || !specs.options || !specs.options.ver) {
      this.log.error(
        chalk.green.bold('File ')
        + chalk.yellow.bold(appSpecsFile)
        + chalk.green.bold(' in dir ')
        + chalk.yellow.bold(parse(cwd()).base)
        + chalk.green.bold(' is corrupted.'));
      return process.exit(1);
    }

    if (specs.options.ver !== currGeneratorVer) {
      this.log.error(
        chalk.green.bold('The app in dir ')
        + chalk.yellow.bold(parse(cwd()).base)
        + chalk.green.bold(' was generated with generator version ')
        + chalk.yellow.bold(specs.options.ver));
      this.log.error(
        chalk.green.bold('It must be upgraded to version ')
        + chalk.yellow.bold(currGeneratorVer)
        + chalk.green.bold(' before using this generator.'));
      return process.exit(1);
    }
  }

  get hasAsync() {
    const asyncNode = '>= 8.0.0';
    const pkgEngineAsync = !(this.pkg.engines && this.pkg.engines.node) ||
      semver.intersects(this.pkg.engines.node, asyncNode);

    return semver.satisfies(process.version, asyncNode) && pkgEngineAsync;
  }

  get libDirectory() {
    return this.pkg.directories && this.pkg.directories.lib;
  }

  get testDirectory() {
    return (this.pkg.directories && this.pkg.directories.test) || 'test';
  }

  _packagerInstall(deps, options) {
    const packager = this.pkg.engines && this.pkg.engines.yarn ? 
      'yarn' : 'npm';
    const method = `${packager}Install`;
    const isDev = options.saveDev;
    const existingDependencies = this.pkg[isDev ? 'devDependencies' : 'dependencies'] || {};
    const dependencies = deps.filter(current => !existingDependencies[current]);

    if(packager === 'yarn' && isDev) {
      options.dev = true;
      delete options.saveDev;
    }

    return this[method](dependencies, options);
  }
};
