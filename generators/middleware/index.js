
const chalk = require('chalk');
const makeDebug = require('debug');
const { cwd } = require('process');
const { kebabCase, camelCase } = require('lodash');
const { parse } = require('path');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

const debug = makeDebug('generator-feathers-plus:prompts:middleware');

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

        // Set missing defaults when call during test
        if (this._opts.calledByTest && this._opts.calledByTest.prompts) {
          this.props = Object.assign({}, this._opts.calledByTest.prompts, this. props);
        }

        initSpecs('middleware', this.props);

        debug('middleware prompting() ends', this.props);

        if (!generator.callWritingFromPrompting()) return;

        debug('middleware writing patch starts. call generatorWriting');
        generatorWriting(generator, 'middleware');
        debug('middleware writing patch ends');
      });
  }

  writing () {
    if (this.callWritingFromPrompting()) return;

    generatorWriting(this, 'middleware');
  }
};
