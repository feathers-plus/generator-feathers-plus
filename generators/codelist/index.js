
const chalk = require('chalk');
const { cwd } = require('process');
const { parse } = require('path');

const Generator = require('../../lib/generator');
const { getFragments } = require('../../lib/code-fragments');

module.exports = class CodelistGenerator extends Generator {
  async prompting () {
    await Generator.asyncInit(this);
  }

  writing () {
    const code = getFragments();
    const dirLen = process.cwd().length + 1;

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
  }
};
