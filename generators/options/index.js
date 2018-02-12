
const chalk = require('chalk');
const { cwd } = require('process');
const { parse } = require('path');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class MiddlewareGenerator extends Generator {
  async prompting () {
    await Generator.asyncInit(this);
    const { props, _specs: specs } = this;
    initSpecs('options');

    this.log();
    this.log([
      chalk.green.bold('The generator will not change the following modules in '),
      chalk.yellow.bold(parse(cwd()).base),
      chalk.green.bold('.\n'),
      chalk.green.bold('You can modify this list by manually changing it in\n'),
      chalk.green.bold(`${parse(cwd()).base}/feathers-gen-specs.json##options.freeze.\n`),
      specs.options.freeze.length ? specs.options.freeze : '  - No files are frozen.',
      chalk.green.bold('\n\nThis project was generated using version '),
      chalk.yellow.bold(specs.options.ver),
      chalk.green.bold(' of the generator.'),
    ].join(''));
    this.log();

    const prompts = [{
      name: 'semicolons',
      message: 'Use semicolons?',
      type: 'confirm',
      default () {
        return !!specs.options.semicolons;
      },
    }, {
      name: 'inspectConflicts',
      message: 'View module changes and control replacement (not recommended)?',
      type: 'confirm',
      default () {
        return !!specs.options.inspectConflicts;
      },
    }];

    return this.prompt(prompts).then(answers => {
      Object.assign(this.props, answers);
    });
  }

  writing () {
    generatorWriting(this, 'options');
  }
};
