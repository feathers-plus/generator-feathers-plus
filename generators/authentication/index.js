
const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { refreshCodeFragments } = require('../../lib/code-fragments');

module.exports = class AuthGenerator extends Generator {
  async initializing() {
    this.fragments = await refreshCodeFragments();
  }

  prompting() {
    const { props } = this;
    this.checkPackage();

    const prompts = [{
      type: 'checkbox',
      name: 'strategies',
      message: 'What authentication providers do you want to use? Other PassportJS strategies not in this list can still be configured manually.',
      default: 'providers',
      choices: [
        {
          name: 'Username + Password (Local)',
          value: 'local',
          checked: true
        }, {
          name: 'Auth0',
          value: 'auth0'
        }, {
          name: 'Google',
          value: 'google'
        }, {
          name: 'Facebook',
          value: 'facebook'
        }, {
          name: 'GitHub',
          value: 'github'
        }]
    }, {
      name: 'entity',
      message: 'What is the name of the user (entity) service?',
      default: 'users'
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
