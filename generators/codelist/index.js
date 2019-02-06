
const chalk = require('chalk');
const makeDebug = require('debug');
const { cwd } = require('process');
const { parse } = require('path');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');

const debug = makeDebug('generator-feathers-plus:prompts:codelist');

module.exports = class CodelistGenerator extends Generator {
  async prompting () {
    await Generator.asyncInit(this);
    const { _specs: specs } = this;
    const generator = this;

    const { ts } = specs.options;
    const jsFormat = ts ? 'ts' : 'js';

    const prompts = [{
      type: 'list',
      name: 'format',
      message: 'What codelist output format?',
      default: 'console',
      choices: () => [
        { name: 'console', value: 'console' },
        { name: jsFormat, value: jsFormat },
        { name: 'json', value: 'json' }
      ]
    }];
    return this.prompt(prompts)
    .then(answers => {
      Object.assign(this.props, answers, {});

        // Set missing defaults when call during test
        if (this._opts.calledByTest && this._opts.calledByTest.prompts) {
          this.props = Object.assign({}, this._opts.calledByTest.prompts, this. props);
        }

        debug('codelist prompting() ends', this.props);

        if (!generator.callWritingFromPrompting()) return;

        debug('codelist writing patch starts. call generatorWriting');
        generatorWriting(generator, 'codelist');
        debug('codelist writing patch ends');
    });
  }

  writing () {
    this.log();
    this.log([
      chalk.green.bold('The custom code found in generated modules in dir '),
      chalk.yellow.bold(parse(cwd()).base),
      ':',
    ].join(''));

    if (this.callWritingFromPrompting()) return;

    generatorWriting(this, 'codelist');
  }
};
