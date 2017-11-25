
const { promisify } = require('util');
import fs from 'fs';
// todo: Allow requires & imports to be added.
//!code: src/app.js-imports //!end

// todo: Allow initialization to be added.
//!code: src/app.js-init //!end

// todo: Allow exports to be added. Last prop must end with a comma.
module.exports = {
  foo: 'bar',
  //!code: src/app.js-exports //!end
};

export function faz() {}
//!code: src/app.js-exports //!end

// todo: Allow code to modify return value.
const returns = 'main value';
//!code: src/app.js-return //!end
return returns;

//!code: src/app.js-end //!end
