
const glob = require('glob');
const { existsSync, readFileSync } = require('fs');

const EOL = '\n';
const moduleHeaders = ['// !module', '//!module', '// ! module'];
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
  resetForTest,
  insertRequiredCustomResources
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
    console.log('');
  } catch (err) {
      console.log(err);
      throw err;
    }
}

async function extractProject () {
  try {
    const files = glob.sync(
      `${destinationRoot}/**/*.{js,ts}`, { ignore: [
          `${destinationRoot}/**/node_modules/**`,
          `${destinationRoot}/public/**`
        ]}
    );

    // Make feathers-gen-code.?s the first module as it contains default code blocks
    let i = files.indexOf(`${destinationRoot}/feathers-gen-code.js`);
    if (i === -1) {
      i = files.indexOf(`${destinationRoot}/feathers-gen-code.ts`);
    }
    if (i !== -1) {
      const first = files.splice(i, 1)[0];
      files.unshift(first);
    }

    await extractFiles(files);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function insertRequiredCustomResources (resources) {
  const resourceKey = `${destinationRoot}/requiredCustomResources`;
  code[resourceKey] = code[resourceKey] || {};
  const text = resources.text || [];

  text.forEach(async path => {
    try {
      const src = await readFileSync(path, 'utf8');
      code[resourceKey][path] = src.split(EOL);
    } catch (err) {
      console.log(`ERROR: ${err.message}. Ignored.`);
    };
  });
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
 //!code:
 // !end
 */
function extractSource (filePathSrc, src) {
  filePathSrc = filePathSrc.replace(/\\/g, '/').replace(/\.(js|ts)$/, '.**');
  let filePath = filePathSrc;
  const len = src.length;

  const isFeathersGenCode = filePathSrc.substr(-20) === 'feathers-gen-code.**';
  let doingCustomCode = false;
  let codeLocation;
  let i = 0;

  while (i < len) {
    const line = src[i].trim();

    if (!doingCustomCode) {
      // Process special code blocks in feathers-gen-code-blocks.**
      if (isFeathersGenCode) {
        // Check if the line starts with module header. Get its length.
        let moduleLen = 0;
        moduleHeaders.forEach(str => {
          if (line.substr(0, str.length) === str) {
            moduleLen = str.length;
            return true;
          }
        });

        if (moduleLen) {
          const relativePath = line.substr(moduleLen).trim().replace(/\\/g, '/').replace(/\.(js|ts)$/, '.**');
          filePath = `${destinationRoot}/${relativePath}`;
        }
      }

      // Check if line starts with custom header. Get its length.
      let leaderLen = 0;
      customLeaders.forEach(str => {
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
        // Erase any previous custom code, likely from feathers-gen-code.?s
        if (code[filePath][codeLocation]) {
          console.log(`. Found replacement custom code for location '${codeLocation}' in ${filePathSrc.substr(destinationRoot.length + 1)}.`);
        }
        code[filePath][codeLocation] = [];
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

  return (name, defaultCode, forceAsNonDefault, options = {}) => {
    name = name.trim();

    if (moduleCode && name in moduleCode) {
      if (!moduleCode[name].length) { // allow fragments with no lines
        return [`${genLeader} ${name}`, genTrailer].join(EOL);
      }

      // console.log('name', name);
      // console.log('moduleCode[name]', typeof moduleCode[name]);
      // console.log('moduleCode[name][0]', moduleCode[name][0]);

      const leadSpaces = moduleCode[name][0].search(/\S|$/);
      const spaces = ''.padStart(leadSpaces + (options.indentEnd || 0));
      return [`${genLeader} ${name}`].concat(moduleCode[name], `${spaces}${genTrailer}`).join(EOL);
    }

    if (defaultCode) {
      defaultCode = Array.isArray(defaultCode) ? defaultCode : [defaultCode];
      const leadSpaces = (defaultCode[0] || '').search(/\S|$/);
      const spaces = ''.padStart(leadSpaces + (options.indentEnd || 0));
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
