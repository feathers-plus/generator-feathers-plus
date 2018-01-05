
const { randomBytes } = require('crypto');
const Generator = require('../../lib/generator');

module.exports = class SecretGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
  }

  writing () {
    this.props = {
      secret: randomBytes(256).toString('hex')
    };
  }

  end () {
    const { secret } = this.props;

    this.log();
    this.log(`Secret: ${secret}`);
  }
};
