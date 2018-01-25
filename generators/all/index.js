
const chalk = require('chalk');
const { cwd } = require('process');
const { parse } = require('path');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class MiddlewareGenerator extends Generator {
  async prompting () {
    Generator.asyncInit(this);
    initSpecs('all');

    this.log();
    this.log([
      chalk.green.bold('We are regenerating the entire app in dir '),
      chalk.yellow.bold(parse(cwd()).base),
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
};
