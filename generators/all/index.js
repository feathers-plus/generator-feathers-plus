
const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
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
        name: 'confirmation',
        message: 'Regenerate the entire application?',
        type: 'confirm',
      },
    ];

    return this.prompt(prompts).then(answers => {
      if (!answers.confirmation) process.exit(0);
      this.logSteps && console.log('>>>>> all generator finished prompting()');
    });
  }

  writing () {
    generatorWriting(this, 'all');
  }
};
