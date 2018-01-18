
const glob = require('glob');
const { existsSync, readFileSync } = require('fs');
const { EOL } = require('os');

const cwd = process.cwd();
let code = {};

module.exports = {
  refreshCodeFragments,
  extractProject,
  extractFiles,
  extractSource,
  insertFragment,
  resetForTest
};

function resetForTest() {
  code = {};
}

async function refreshCodeFragments () {
  try {
    return await extractProject();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function extractProject () {
  try {
    const files = glob.sync('**/*.js', { ignore: 'node_modules/**' });
    return await extractFiles(files);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function extractFiles (filePaths, ifCheck) {
  try {
    let code = {};

    for (let i = 0, leni = filePaths.length; i < leni; i++) {
      const filePath = filePaths[i];

      if (ifCheck && !(await existsSync(filePath))) {
        break;
      }

      const src = await readFileSync(filePath, 'utf8');
      code = Object.assign({}, code, extractSource(filePath, src.split(EOL)));
    }

    return code;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

function extractSource (filePath, src) {
  filePath = filePath.replace(cwd, '').replace(/\\/g, '/');
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
        code[filePath][codeLocation] = [];
        doingCustomCode = true;
      }
    } else {
      if (line.substr(0, 6) === '//!end' || line.substr(0, 7) === '// !end') {
        doingCustomCode = false;
      } else {
        code[filePath][codeLocation].push(src[i]);
      }
    }

    i += 1;
  }

  return code;
}

function insertFragment (filePath) {
  const linuxPath = filePath.replace(/\\/g, '/').replace(`${cwd}/`, '');
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

const { inspect } = require('util');
function inspector (desc, obj, depth = 5) {
  console.log(`\n${desc}`);
  console.log(inspect(obj, { depth, colors: true }));
}
