
const chalk = require('chalk');
const { join } = require('path');
const doesFileExist = require('./does-file-exist');
const { insertFragment } = require('./code-fragments');

const fileNames = [];

module.exports = {
  generatorFs,
  getFileNames: () => fileNames,
};

function generatorFs (generator, context1, todos) {
  const freeze = generator._specs.options.freeze || [];
  generator.conflicter.force = !generator._specs.options.inspectConflicts;

  // type:   'tpl' - expand template, 'copy' - copy file, 'json' - write JSON as file.
  // src:    path & file of template or source file. Array of folder names or str.
  // obj:    Object to write as JSON.
  // dest:   path & file of destination. Array to .join() or str.
  // ifNew:  true: Write file only if it does not yet exist, false: always write it.
  // ifSkip: true: Do not write this file, false: write it.
  // ctx:    Extra content to call template with.
  // Note that frozen files are never written.
  todos.forEach(({ type, src, obj, dest, ifNew, ifSkip, ctx }) => {
    dest = Array.isArray(dest) ? join(...dest) : dest;
    src = Array.isArray(src) ? src : [src];
    const context = ctx ? Object.assign({}, context1, ctx) : context1;

    const destinationPath = generator.destinationPath(dest);

    if (!ifSkip) {
      fileNames.push(destinationPath);
    }

    if (!ifSkip && (!ifNew || !doesFileExist(destinationPath))) {
      // todo Consider using isaacs/minimatch instead.
      if (freeze.indexOf(dest) !== -1) {
        generator.log(chalk.cyan('   freeze'), dest);
        return;
      }

      // console.log('\ntype=', type, 'src=', src);

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
            obj
          );
          break;
        default:
          throw new Error(`Unknown type ${type}. (generatorFs)`);
      }
    } else {
      generator.log(chalk.cyan('     skip'), dest);
    }
  });
}
