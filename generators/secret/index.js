
const chalk = require('chalk');
const { randomBytes } = require('crypto');
const Generator = require('../../lib/generator');

module.exports = class SecretGenerator extends Generator {
  writing () {
    const secret = randomBytes(256).toString('hex');
    this.log();
    this.log(chalk.yellow.bold('Secret:'), `${secret}`);
  }
};
