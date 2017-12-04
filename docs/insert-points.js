
const { promisify } = require('util');
import fs from 'fs';
// todo: Allow requires & imports to be added.
//!code: imports //!end

// todo: Allow initialization to be added.
//!code: init //!end

// todo: Allow exports to be added. Last prop must end with a comma.
let moduleExports = {
  foo: 'bar',
  //!code: moduleExports //!end
};

let moduleExports = function (...) {
  ...
  // todo: Allow function initialization to be added.
  //!code: func_init //!end
  ...
  // todo: Allow code to modify return value.
  let returns = 'main value';
  //!code: func_return //!end
  return returns;
}

// todo: All extra code before exports.
//!code: more //!end

// todo: Allow exports to be modified
//!code: exports //!end
module.exports = moduleExports;

export function faz() {}
//!code: export //!end

// todo: Allow function definitions
//!code: funcs //!end

// todo: Very end of module
//!code: end //!end
