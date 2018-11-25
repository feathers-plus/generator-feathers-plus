
const chalk = require('chalk');
const makeDebug = require('debug');
const { cwd } = require('process');
const { join } = require('path');
const { parse } = require('path');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const doesFileExist = require('../../lib/does-file-exist');
const { initSpecs } = require('../../lib/specs');

const debug = makeDebug('generator-feathers-plus:prompts:fakes');

module.exports = class FakesGenerator extends Generator {
  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    initSpecs('fakes');
    const generator = this;

    const existingDefaultJsPath = this.destinationPath(join('config', 'default.js'));
    const ifRegen = doesFileExist(existingDefaultJsPath);

    if (!ifRegen) {
      this.log();
      this.log([
        chalk.green.bold('We are generating fake service data for the first time in dir '),
        chalk.yellow.bold(parse(cwd()).base),
        chalk.green.bold('.'),
      ].join(''));
      this.log();
      this.log([
        chalk.green.bold('The configuration controlling the faking resides in '),
        chalk.yellow.bold('config/default.js'),
        chalk.green.bold('.'),
      ].join(''));
      this.log(
        chalk.green.bold('You can change this configuration and rerun "feathers-plus generate fakes".')
      );
      this.log();
    } else {
      this.log();
      this.log([
        chalk.green.bold('We are regenerating the existing fake service data in dir '),
        chalk.yellow.bold(parse(cwd()).base),
      ].join(''));
      this.log();
    }

    const prompts = [{
      name: 'confirmation',
      message: 'Regenerate the fakes service data?',
      type: 'confirm'
    }];

    return this.prompt(prompts)
      .then(answers => {
        if (!answers.confirmation) process.exit(0);

        debug('fakes prompting() ends', this.props);

        if (!generator.callWritingFromPrompting()) return;

        debug('fakes writing patch starts. call generatorWriting');
        generatorWriting(generator, 'fakes');
        debug('fakes writing patch ends');
      });
  }

  writing () {
    if (this.callWritingFromPrompting()) return;

    generatorWriting(this, 'fakes');
  }
};
