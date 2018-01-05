
const { kebabCase, camelCase } = require('lodash');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');
const { refreshCodeFragments } = require('../../lib/code-fragments');

module.exports = class MiddlewareGenerator extends Generator {
  async initializing() {
    this.fragments = await refreshCodeFragments();
  }

  prompting () {
    this.checkPackage();
    const { props, _specs: specs } = this;

    const prompts = [
      {
        name: 'name',
        message: 'What is the name of the Express middleware?'
      },
      {
        name: 'path',
        message: 'What is the mount path?',
        default: '*'
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props, {
        kebabName: kebabCase(props.name),
        camelName: camelCase(props.name)
      });

      initSpecs('middleware', props);
      this.logSteps && console.log('>>>>> middleware generator finished prompting()');
    });
  }

  writing () {
    generatorWriting(this, 'middleware');
  }
};
