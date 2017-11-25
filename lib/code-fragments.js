
const glob = require('glob');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { promisify } = require('util');
const { join } = require('path');
const { EOL } = require('os');

const CODE_FRAG_PATH = 'feathers-gen-fragments.json';
const cwd = join(process.cwd(), '');
console.log('cwd', cwd);

let code = {};

module.exports = {
  refreshCodeFragments,
  extractProject,
  extractFiles,
  extractSource,
  insertFragment,
};

async function refreshCodeFragments() {
  console.log('\n...Extracting custom code\n');

  try {
    const code = await extractProject();
    const fileName = join(process.cwd(), CODE_FRAG_PATH);

    writeFileSync(fileName, JSON.stringify(code, null, 2));
    return code;
  } catch(err) {
    console.log(err);
    throw err;
  }
}

async function extractProject() {
  try {
    const files = await promisify(glob)('**/*.js', { ignore: 'node_modules/**' });
    return await extractFiles(files);
  } catch(err) {
    console.log(err);
    throw err;
  }
}

async function extractFiles(filePaths, ifCheck) {
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
  } catch(err) {
    console.log(err);
    throw err;
  }
}

function extractSource(filePath, src) {
  filePath = filePath.replace(cwd, '').replace(/\\/g, '/');
  const len = src.length;

  let doingCustomCode = false;
  let codeLocation;
  let i = 0;

  while (i < len) {
    const line = src[i].trim();

    if (!doingCustomCode) {
      if (line.substr(0, 8) === '//!code:' && line.indexOf('//!end') === -1) {
        codeLocation = line.substr(8).trim();
        code[filePath] = code[filePath] || {};
        code[filePath][codeLocation] = [];
        doingCustomCode = true;
      }
    } else {
      if (line.substr(0, 6) === '//!end') {
        doingCustomCode = false;
      } else {
        code[filePath][codeLocation].push(line);
      }
    }

    i += 1;
  }

  return code;
}

function insertFragment(filePath) {
  const linuxPath = filePath.replace(/\\/g, '/');
  const moduleCode = code[linuxPath];

  return (name, defaultCode) => {
    name = name.trim();

    if (moduleCode && name in moduleCode && moduleCode[name].length) {
      return [`//!code: ${name}`].concat(moduleCode[name], '//!end').join(EOL);
    }
    if (defaultCode) {
      return [`//!location: ${name}`].concat('//!default', defaultCode, '//!end').join(EOL);
    }

    return `//!code: ${name} //!end`;
  }
}
