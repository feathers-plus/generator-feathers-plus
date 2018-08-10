
const chalk = require('chalk');
const Generator = require('yeoman-generator');
const semver = require('semver');
const { cwd } = require('process');
const { kebabCase } = require('lodash');
const { parse } = require('path');
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

    if (!semver.satisfies(process.version, '>= 8.0.0')) {
      this.log.error('The generator is only tested to work with Node v8.0.0 and up!');
    }

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

  getNameSpace(subFolder = '') {
    if (subFolder === '') {
      return ['', [], ''];
    }
    console.log(subFolder);
    const parts = subFolder.split('/').map(part => kebabCase(part));
    if (subFolder.substr(-1) === '/') {
      parts.pop();
    }

    return [`${parts.join('/')}/`, parts, '../'.repeat(parts.length)];
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
    const dependencies = deps.filter(current => !existingDependencies[current]);

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
};
