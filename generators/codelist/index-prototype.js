
const chalk = require('chalk');
const { cwd } = require('process');
const { EOL } = require('os');
const { join, parse } = require('path');

const Generator = require('../../lib/generator');
const { getFragments } = require('../../lib/code-fragments');

const RESOURCES_HEADER= 'requiredCustomResources';

module.exports = class CodelistGenerator extends Generator {
  async prompting () {
    await Generator.asyncInit(this);
  }

  writing () {
    const dirLen = process.cwd().length + 1;
    const resourcesHeader = join(this.destinationRoot(), RESOURCES_HEADER);
    const { props, _specs: specs } = this;

    // Get source from code insertion points
    const code = getFragments();

    // Add sources from requiredCustomResources.files.text
    delete code[resourcesHeader];
    const customFilesText = ((specs[RESOURCES_HEADER] || {}).files || {}).text;

    if (customFilesText) {
      const customFiles = Array.isArray(customFilesText) ? customFilesText : [customFilesText];
      const codeResourcesHeader = code[resourcesHeader] = {};

      customFiles.forEach(path => {
        try {
          const source = this.fs.read(this.destinationPath(path));
          codeResourcesHeader[path] = source.split(EOL);
        } catch (err) {
          console.log(`ERROR: ${err.message}. Ignored.`);
        }
      });
    }

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


/*
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
*/
