
const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs, setPath } = require('../../lib/specs');

module.exports = class MiddlewareGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
  }

  async prompting () {
    const appSpecsFile = 'feathers-gen-specs.json';
    this._specs = await setPath(this, this.destinationPath(appSpecsFile));
    this.checkDirContainsApp();
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
