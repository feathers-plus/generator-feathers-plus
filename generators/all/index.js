
const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class MiddlewareGenerator extends Generator {
  async prompting () {
    Generator.asyncInit(this);
    initSpecs('all');

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
