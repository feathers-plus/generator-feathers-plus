
const chalk = require('chalk');
const { cwd } = require('process');
const { kebabCase, camelCase } = require('lodash');
const { parse } = require('path');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class MiddlewareGenerator extends Generator {
  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { _specs: specs } = this;
    const generator = this;
    let defaultPath;

    const prompts = [{
      name: 'name',
      message: 'What is the name of the Express middleware?',
      validate (input) {
        generator.log('\n\n');
        if (!specs.middlewares || !specs.middlewares[input]) {
          defaultPath = '*';
          generator.log([
            chalk.green.bold('We are'),
            chalk.yellow.bold(' adding '),
            chalk.green.bold('a new middleware in dir '),
            chalk.yellow.bold(parse(cwd()).base)
          ].join(''));
        } else {
          defaultPath = specs.middlewares[input].path;
          generator.log([
            chalk.green.bold('We are'),
            chalk.yellow.bold(' updating '),
            chalk.green.bold('an existing middleware in dir '),
            chalk.yellow.bold(parse(cwd()).base)
          ].join(''));
        }
        generator.log();

        return true;
      }
    }, {
      name: 'path',
      message: 'What is the mount path?',
      default: () => defaultPath
    }];

    return this.prompt(prompts)
      .then(answers => {
        Object.assign(this.props, answers, {
          kebabName: kebabCase(answers.name),
          camelName: camelCase(answers.name)
        });

        initSpecs('middleware', this.props);
        this.logSteps && console.log('>>>>> middleware generator finished prompting()');
      });
  }

  writing () {
    generatorWriting(this, 'middleware');
  }
};
