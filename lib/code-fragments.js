
const glob = require('glob');
const { existsSync, readFileSync } = require('fs');
const { EOL } = require('os');

let code = {};
let destinationRoot;

module.exports = {
  refreshCodeFragments,
  insertFragment,
  resetForTest
};

function resetForTest () {
  code = {};
  destinationRoot = undefined;
}

async function refreshCodeFragments (destinationRoot1) {
  destinationRoot = destinationRoot1;

  try {
    await extractProject();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function extractProject () {
  try {
    const files = glob.sync(
      `${destinationRoot}/**/*.js`, { ignore: `${destinationRoot}/node_modules/**` }
    );
    await extractFiles(files);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function extractFiles (filePaths, ifCheck) {
  try {
    for (let i = 0, leni = filePaths.length; i < leni; i++) {
      const filePath = filePaths[i];

      if (ifCheck && !(await existsSync(filePath))) {
        break;
      }

      const src = await readFileSync(filePath, 'utf8');
      extractSource(filePath, src.split(EOL));
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

function extractSource (filePath, src) {
  filePath = filePath.replace(/\\/g, '/');
  const len = src.length;

  let doingCustomCode = false;
  let codeLocation;
  let i = 0;

  while (i < len) {
    const line = src[i].trim();

    if (!doingCustomCode) {
      if (line.substr(0, 8) === '//!code:' && line.indexOf('//!end') === -1 && line.indexOf('// !end') === -1) {
        codeLocation = line.substr(8).trim();
        code[filePath] = code[filePath] || {};
        // Prevent loss of lines should there be 2 locations with the same 'codeLocation' name
        code[filePath][codeLocation] = code[filePath][codeLocation] || [];
        doingCustomCode = true;
      }
    } else {
      // WebStorm editor inserts a blank into //!end when you CR on //!code: xxx //!end
      if (line.substr(0, 6) === '//!end' || line.substr(0, 7) === '// !end') {
        doingCustomCode = false;
      } else {
        code[filePath][codeLocation].push(src[i]);
      }
    }

    i += 1;
  }
}

function insertFragment (filePath) {
  const linuxPath = filePath.replace(/\\/g, '/');
  const moduleCode = code[linuxPath];

  return (name, defaultCode) => {
    name = name.trim();

    if (moduleCode && name in moduleCode) {
      if (!moduleCode[name].length) { // allow fragments with no lines
        return [`//!code: ${name}`, `//!end`].join(EOL);
      }

      const leadSpaces = moduleCode[name][0].search(/\S|$/);
      const spaces = ''.padStart(leadSpaces);
      return [`//!code: ${name}`].concat(moduleCode[name], `${spaces}//!end`).join(EOL);
    }

    if (defaultCode) {
      defaultCode = Array.isArray(defaultCode) ? defaultCode : [defaultCode];
      const leadSpaces = (defaultCode[0] || '').search(/\S|$/);
      const spaces = ''.padStart(leadSpaces);
      return [`//!<DEFAULT> code: ${name}`].concat(defaultCode, `${spaces}//!end`).join(EOL);
    }

    return `//!code: ${name} //!end`;
  };
}
