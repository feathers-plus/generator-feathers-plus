
const chalk = require('chalk');
const { cwd } = require('process');
const { join, parse } = require('path');

const Generator = require('../../lib/generator');
const { insertRequiredCustomResources, getFragments } = require('../../lib/code-fragments');

const RESOURCE_HEADER = 'requiredCustomResources';

module.exports = class CodelistGenerator extends Generator {
  async prompting () {
    await Generator.asyncInit(this);
  }

  async writing () {
    const { _specs: specs } = this;
    const resourceHeader = join(process.cwd(), RESOURCE_HEADER);
    const resources = (specs.requiredCustomResources || {}).files || {};
    await insertRequiredCustomResources(resources);

    let code = getFragments();
    const dirLen = process.cwd().length + 1;

    const requiredResourceCode = code[resourceHeader] || {};

    delete code[resourceHeader];

    this.log();
    this.log([
      chalk.green.bold('The custom code found in generated modules in dir '),
      chalk.yellow.bold(parse(cwd()).base),
      ':',
    ].join(''));

    Object.keys(code).forEach(filePath => {
      const codeFilePath = code[filePath];
      this.log();
      this.log(chalk.yellow.bold(`// !module ${filePath.substr(dirLen)}`));
      this.log();

      Object.keys(codeFilePath).forEach(codeLocation => {
        this.log(chalk.green.bold(`// !code: ${codeLocation}`));
        this.log(codeFilePath[codeLocation].join('\n'));
        this.log(chalk.green.bold('// !end'));
      });
    });
    if (Object.keys(requiredResourceCode).length > 0) {
      this.log();
      this.log(chalk.yellow.bold(`// !module ${RESOURCE_HEADER}`));
      this.log();
      Object.keys(requiredResourceCode).forEach(resourceLocation => {
        const resourceCode = requiredResourceCode[resourceLocation];
        this.log(chalk.green.bold(`// !code: ${resourceLocation}`));
        this.log(resourceCode.join('\n'));
        this.log(chalk.green.bold('// !end'));
      });
    }
  }
};
