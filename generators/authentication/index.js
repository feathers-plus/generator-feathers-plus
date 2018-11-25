
const chalk = require('chalk');
const makeDebug = require('debug');
const { parse } = require('path');
const { cwd } = require('process');
const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class AuthGenerator extends Generator {
  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { _specs: specs } = this;
    this._initialGeneration = !specs.authentication;
    initSpecs('authentication');

    this.log('\n\n');
    if (this._initialGeneration) {
      this.log([
        chalk.green.bold('We are'),
        chalk.yellow.bold(' adding '),
        chalk.green.bold('initial authentication in dir '),
        chalk.yellow.bold(parse(cwd()).base)
      ].join(''));
    } else {
      this.log([
        chalk.green.bold('We are'),
        chalk.yellow.bold(' updating '),
        chalk.green.bold('the authentication in dir '),
        chalk.yellow.bold(parse(cwd()).base)
      ].join(''));
    }
    this.log();

    const ifStrategy = value => specs.authentication && specs.authentication.strategies &&
      specs.authentication.strategies.indexOf(value) !== -1;

    const prompts = [{
      type: 'checkbox',
      name: 'strategies',
      message: 'What authentication providers do you want to use?\n  Other PassportJS strategies not in this list can still\n  be configured manually.\n',
      choices: [
        {
          name: 'Username + Password (Local)',
          value: 'local',
          checked: !specs.authentication.strategies.length || ifStrategy('local')
        }, {
          name: 'Auth0',
          value: 'auth0',
          checked: ifStrategy('auth0')
        }, {
          name: 'Google',
          value: 'google',
          checked: ifStrategy('google')
        }, {
          name: 'Facebook',
          value: 'facebook',
          checked: ifStrategy('facebook')
        }, {
          name: 'GitHub',
          value: 'github',
          checked: ifStrategy('github')
        }]
    }, {
      name: 'entity',
      message: 'What is the name of the user (entity) service?',
      default: (specs.authentication && specs.authentication.entity) || 'users'
    }];

    return this.prompt(prompts)
      .then(answers => {
        Object.assign(this.props, answers);

        // Set missing defaults when call during test
        if (this._opts.calledByTest && this._opts.calledByTest.prompts) {
          this.props = Object.assign({}, this._opts.calledByTest.prompts, this. props);
        }
      });
  }

  writing () {
    generatorWriting(this, 'authentication');
  }
};
