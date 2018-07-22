
const glob = require('glob');
const { existsSync, readFileSync } = require('fs');

const EOL = '\n';
const customLeaders = ['// !code:', '// !<> code:', '//!code:', '// ! code:'];
const customTrailers = ['// !end', '//!end'];
const genLeader = customLeaders[0];
const genTrailer = customTrailers[0];
const genDefaultLeader = '// !<DEFAULT> code:';

let code = {};
let destinationRoot;

module.exports = {
  refreshCodeFragments,
  insertFragment,
  getFragment,
  getFragments,
  resetForTest
};

function resetForTest () {
  code = {};
  destinationRoot = undefined;
}

async function refreshCodeFragments (destinationRoot1) {
  destinationRoot = destinationRoot1;

  try {
    const startTime = process.hrtime();
    await extractProject();
    const diffTime = process.hrtime(startTime);
    console.log('Source scan took %ds %dms', diffTime[0], Math.round(diffTime[1]/1000000));
  } catch (err) {
      console.log(err);
      throw err;
    }
}

async function extractProject () {
  try {
    const files = glob.sync(
      `${destinationRoot}/**/*.{js,ts}`, { ignore: `${destinationRoot}/**/node_modules/**` }
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

/*
 // !code:
 // !<> code:
 // !end
 */
function extractSource (filePath, src) {
  filePath = filePath.replace(/\\/g, '/').replace(/\.(js|ts)$/, '.**');
  const len = src.length;

  let doingCustomCode = false;
  let codeLocation;
  let i = 0;

  while (i < len) {
    const line = src[i].trim();

    if (!doingCustomCode) {
      // Check if line starts with custom header. Get its length.
      let leaderLen = 0;
      customLeaders.some(str => {
        if (line.substr(0, str.length) === str) {
          leaderLen = str.length;
          return true;
        }
      });

      // Check if line contains a custom trailer
      const anyTrailer = customTrailers.some(str => line.indexOf(str) !== -1);

      if (leaderLen && !anyTrailer) {
        codeLocation = line.substr(leaderLen).trim();
        code[filePath] = code[filePath] || {};
        // Prevent loss of lines should there be 2 locations with the same 'codeLocation' name
        code[filePath][codeLocation] = code[filePath][codeLocation] || [];
        doingCustomCode = true;
      }
    } else {
      // Check if line starts with a custom trailer.
      if (customTrailers.some(str => line.substr(0, str.length) === str)) {
        doingCustomCode = false;
      } else {
        code[filePath][codeLocation].push(src[i]);
      }
    }

    i += 1;
  }
}

function insertFragment (filePath) {
  const linuxPath = filePath.replace(/\\/g, '/').replace(/\.(js|ts)$/, '.**');
  const moduleCode = code[linuxPath] || {};

  /*
  console.log('\nfilePath', filePath);
  console.log('linuxPath', linuxPath);
  console.log('moduleCode', typeof moduleCode);
  console.log('moduleCode keys', Object.keys(moduleCode));
  */

  return (name, defaultCode, forceAsNonDefault) => {
    name = name.trim();

    if (moduleCode && name in moduleCode) {
      if (!moduleCode[name].length) { // allow fragments with no lines
        return [`${genLeader} ${name}`, genTrailer].join(EOL);
      }

      /*
      console.log('name', name);
      console.log('moduleCode[name]', typeof moduleCode[name]);
      console.log('moduleCode[name][0]', moduleCode[name][0]);
      */

      const leadSpaces = moduleCode[name][0].search(/\S|$/);
      const spaces = ''.padStart(leadSpaces);
      return [`${genLeader} ${name}`].concat(moduleCode[name], `${spaces}${genTrailer}`).join(EOL);
    }

    if (defaultCode) {
      defaultCode = Array.isArray(defaultCode) ? defaultCode : [defaultCode];
      const leadSpaces = (defaultCode[0] || '').search(/\S|$/);
      const spaces = ''.padStart(leadSpaces);
      return [`${forceAsNonDefault ? genLeader : genDefaultLeader} ${name}`]
        .concat(defaultCode, `${spaces}${genTrailer}`).join(EOL);
    }

    return `${genLeader} ${name} ${genTrailer}`;
  };
}

function getFragment (filePath) {
  const linuxPath = filePath.replace(/\\/g, '/');
  const moduleCode = code[linuxPath];

  return name => moduleCode && name.trim() in moduleCode ? moduleCode[name.trim()] : undefined;
}

function getFragments() {
  return code;
}
