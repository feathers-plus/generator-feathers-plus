
const chalk = require('chalk');
const { join } = require('path');
const doesFileExist = require('./does-file-exist');
const { insertFragment } = require('./code-fragments');

module.exports = function generatorFs(generator, context1, todos) {

  todos.forEach(({ type, src, obj, dest, ifNew, ifSkip, ctx }) => {
    // todo console.log('generator-fs', type, src, obj, dest, ifNew, ifSkip, ctx);
    dest = Array.isArray(dest) ? dest : [dest];
    src = Array.isArray(src) ? src : [src];
    const context = ctx ? Object.assign({}, context1, ctx) : context1;

    // todo generator.conflicter.force = true;

    const destinationPath = generator.destinationPath(...dest);

    if (!ifSkip && (!ifNew || !doesFileExist(destinationPath))) {
      switch (type) {
        case 'tpl':
          generator.fs.copyTpl(
            generator.templatePath(join(...src)),
            destinationPath,
            Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
          );
          break;
        case 'copy':
          generator.fs.copy(
            generator.templatePath(join(...src)),
            generator.destinationPath(destinationPath)
          );
          break;
        case 'json':
          generator.fs.writeJSON(
            generator.destinationPath(destinationPath),
            obj,
          );
          break;
        default:
          throw new Error(`Unknown type ${type}. (generatorFs)`);
      }
    } else {
      generator.log(chalk.cyan('     skip'), dest.join('/'));
    }
  });
};
