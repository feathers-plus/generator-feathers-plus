
const chalk = require('chalk');
const { cwd } = require('process');
const { kebabCase, camelCase } = require('lodash');
const { parse } = require('path');

const Generator = require('../../lib/generator');
const generatorWriting = require('../writing');
const { initSpecs } = require('../../lib/specs');

module.exports = class MiddlewareGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
  }

  prompting () {
    this.checkDirContainsApp();
    const { _specs: specs } = this;
    const generator = this;
    let defaultPath;

    const prompts = [{
      name: 'name',
      message: 'What is the name of the Express middleware?',
      validate (input) {
        if (!specs.middlewares || !specs.middlewares[input]) {
          defaultPath = '*';
          generator.log(
            '\n\n'
            + chalk.green.bold('We are creating a new middleware in dir ')
            + chalk.yellow.bold(parse(cwd()).base)
            + '\n'
          );
        } else {
          defaultPath = specs.middlewares[input].path;
          generator.log(
            '\n\n'
            + chalk.green.bold('We are changing an existing middleware in dir ')
            + chalk.yellow.bold(parse(cwd()).base)
            + '\n'
          );
        }

        return true;
      }
    }, {
      name: 'path',
      message: 'What is the mount path?',
      default: () => defaultPath,
    }];

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
