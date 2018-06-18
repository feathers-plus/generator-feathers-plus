
// Logger. (Can be re-generated.)
const { createLogger, format, transports } = require('winston')
// !code: imports // !end
// !code: init // !end

// Configure the Winston logger. For the complete documentation seee https://github.com/winstonjs/winston
const moduleExports = createLogger({
  // !<DEFAULT> code: level
  // To see more detailed errors, change this to debug'
  level: 'info',
  // !end
  // !<DEFAULT> code: format
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  // !end
  // !<DEFAULT> code: transport
  transports: [
    new transports.Console()
  ],
  // !end
  // !code: moduleExports // !end
})

// !code: exports // !end
module.exports = moduleExports

// !code: funcs // !end
// !code: end // !end
