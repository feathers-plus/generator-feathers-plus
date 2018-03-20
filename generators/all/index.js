
const chalk = require('chalk');
const { cwd } = require('process');
const { parse } = require('path');
const { unlinkSync } = require('fs');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const doesFileExist = require('../../lib/does-file-exist');
const { getFileNames } = require('../../lib/generator-fs');
const { initSpecs } = require('../../lib/specs');

module.exports = class AllGenerator extends Generator {
  async prompting () {
    await Generator.asyncInit(this);
    initSpecs('all');
    const { props, _specs: specs } = this;

    this.log();
    this.log([
      chalk.green.bold('Regenerate the entire app in dir '),
      chalk.yellow.bold(parse(cwd()).base),
      chalk.green.bold(` in ${specs.options.ts ? 'TypeScript' : 'JavaScript'}`),
    ].join(''));
    this.log();

    const prompts = [{
      name: 'confirmation',
      message: 'Regenerate the entire application?',
      type: 'confirm'
    }];

    return this.prompt(prompts)
      .then(answers => {
        if (!answers.confirmation) process.exit(0);
      });
  }

  writing () {
    generatorWriting(this, 'all');
  }

  install() {
    let { _specs: specs, dependenciesList } = this;

    // Install all dependencies at once as that's much faster
    const packager = this.pkg.engines && this.pkg.engines.yarn ? 'yarn' : 'npm';
    const method = `${packager}Install`;

    dependenciesList.prod = [...new Set(dependenciesList.prod)].sort(); // get unique elements
    dependenciesList.dev = [...new Set(dependenciesList.dev)].sort();

    this.log(chalk.green(`\nInstalling ${dependenciesList.prod.length} dependencies.`));
    this.log(chalk.green(`Installing ${dependenciesList.dev.length} development dependencies.`));

    if (dependenciesList.prod.length) {
      this[method](dependenciesList.prod, { save: true });
    }
    if (dependenciesList.dev.length) {
      this[method](dependenciesList.dev, { [packager === 'npm' ? 'saveDev' : 'dev']: true });
    }

    // Remove files should a conversion between .js and .ts have occurred.
    const dirLen = process.cwd().length + 1;
    const freeze = specs.options.freeze || [];
    const frozenFiles = [];

    const currSuffix = specs.options.ts ? '.ts' : '.js';
    const currFiles = [...new Set(getFileNames())].sort(); // Get unique names.
    const removeSuffix = currSuffix === '.js' ? '.ts' : '.js';
    const removeFiles = currFiles.filter(path => path.substr(-3) === currSuffix)
      .map(path => `${path.substring(0, path.length - 3)}${removeSuffix}`);

    removeFiles.forEach(path => {
      if (freeze.indexOf(path.substr(dirLen)) !== -1) {
        frozenFiles.push(path);
        return;
      }

      if (doesFileExist(path)) {
        this.log(chalk.cyan('   remove'), path.substr(dirLen));
        unlinkSync(path);
      }
    });

    if (frozenFiles.length) {
      this.log(chalk.yellow.bold('\nYou must remove these files manually before using the generator again:'));

      frozenFiles.forEach(path => {
        this.log(chalk.cyan('   frozen'), path.substr(dirLen));
      });
    }
  }
};
