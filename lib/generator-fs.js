
const { join } = require('path');
const doesFileExist = require('./does-file-exist');
const { insertFragment } = require('./code-fragments');

module.exports = function generatorFs(generator, context, todos) {

  todos.forEach(({ type, source = [], sourceObj = {}, destination, ifNew, ifSkip }) => {
    destination = Array.isArray(destination) ? destination : [destination];
    source = Array.isArray(source) ? source : [source];

    // generator.conflicter.force = true;

    const destinationPath = generator.destinationPath(...destination);
    const sourcePath = join(...source);

    if (!ifSkip && (!ifNew || !doesFileExist(destinationPath))) {
      switch (type) {
        case 'tpl':
          generator.fs.copyTpl(
            generator.templatePath(sourcePath),
            destinationPath,
            Object.assign({}, context, { insertFragment: insertFragment(destinationPath) })
          );
          break;
        case 'copy':
          generator.fs.copy(
            generator.templatePath(sourcePath),
            generator.destinationPath(destinationPath)
          );
          break;
        case 'json':
          generator.fs.writeJSON(
            generator.destinationPath(destinationPath),
            sourceObj,
          );
          break;
        default:
          throw new Error(`Unknown type ${type}. (generatorFs)`);
      }
    } else {
      console.log('>>> skip', type, destination.join('/'));
    }
  });
};
