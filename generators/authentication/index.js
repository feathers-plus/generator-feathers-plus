
const chalk = require('chalk');
const { parse } = require('path');
const { cwd } = require('process');
const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class AuthGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
  }

  async prompting () {
    this.checkDirContainsApp();
    await Generator.asyncInit(this);
    const { props, _specs: specs } = this;
    this._initialGeneration = !specs.authentication;
    initSpecs('authentication');

    if (this._initialGeneration) {
      this.log(
        '\n\n'
        + chalk.green.bold('We are adding initial authentication in dir ')
        + chalk.yellow.bold(parse(cwd()).base)
        + '\n'
      );
    } else {
      this.log(
        '\n\n'
        + chalk.green.bold('We are changing the authentication in dir ')
        + chalk.yellow.bold(parse(cwd()).base)
        + '\n'
      );
    }

    const ifStrategy = value => specs.authentication && specs.authentication.strategies &&
      specs.authentication.strategies.indexOf(value) !== -1;

    console.log('!specs.authentication.strategies.length', !specs.authentication.strategies.length);
    console.log('ifStrategy(\'local\')', ifStrategy('local'));

    const prompts = [{
      type: 'checkbox',
      name: 'strategies',
      message: 'What authentication providers do you want to use? Other PassportJS strategies not in this list can still be configured manually.',
      default: 'providers',
      choices: [
        {
          name: 'Username + Password (Local)',
          value: 'local',
          checked: !specs.authentication.strategies.length || ifStrategy('local'),
        }, {
          name: 'Auth0',
          value: 'auth0',
          checked: ifStrategy('auth0'),
        }, {
          name: 'Google',
          value: 'google',
          checked: ifStrategy('google'),
        }, {
          name: 'Facebook',
          value: 'facebook',
          checked: ifStrategy('facebook'),
        }, {
          name: 'GitHub',
          value: 'github',
          checked: ifStrategy('github'),
        }]
    }, {
      name: 'entity',
      message: 'What is the name of the user (entity) service?',
      default: specs.authentication && specs.authentication.entity || 'users',
    }];

    return this.prompt(prompts).then(props1 => {
      this.props = Object.assign(props, props1);

      this.logSteps && console.log('>>>>> authentication generator finished prompting()');
    });
  }

  writing() {
    generatorWriting(this, 'authentication');
  }
};
