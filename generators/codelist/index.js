
const chalk = require('chalk');
const { cwd } = require('process');
const { parse } = require('path');

const Generator = require('../../lib/generator');
const { getFragments, formatCodelist, flattenCodelist } = require('../../lib/code-fragments');

module.exports = class CodelistGenerator extends Generator {
  async prompting () {
    await Generator.asyncInit(this);
  }

  writing () {
    const code = getFragments();
    const dirLen = process.cwd().length + 1;

    let codelist;

    codelist = formatCodelist(code, dirLen);

    this.log();
    this.log([
      chalk.green.bold('The custom code found in generated modules in dir '),
      chalk.yellow.bold(parse(cwd()).base),
      ':',
    ].join(''));

    codelist = flattenCodelist(codelist, this.log);
  }
};
