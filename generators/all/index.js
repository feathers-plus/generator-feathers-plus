
const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

const appSpecsFile = 'feathers-gen-specs.json';

module.exports = class MiddlewareGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
  }

  async prompting () {
    Generator.asyncInit(this);
    initSpecs('all');

    const prompts = [{
      name: 'confirmation',
      message: 'Regenerate the entire application?',
      type: 'confirm',
    }];

    return this.prompt(prompts).then(answers => {
      if (!answers.confirmation) process.exit(0);
      this.logSteps && console.log('>>>>> all generator finished prompting()');
    });
  }

  writing () {
    generatorWriting(this, 'all');
  }
};
