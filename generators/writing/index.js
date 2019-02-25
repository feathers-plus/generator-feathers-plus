
/* eslint-disable no-console */
const makeDebug = require('debug');
const merge = require('lodash.merge');

const { camelCase, kebabCase, snakeCase, upperFirst } = require('lodash');
const { join } = require('path');

const { app } = require('./app');
const { service } = require('./service');
const { connection } = require('./connection');
const { authentication } = require('./authentication');
const { middleware } = require('./middleware');
const { graphql } = require('./graphql');
const { hook } = require('./hook');
const { fakes } = require('./fakes');
const { test } = require('./test-1');
const { resources } = require('./resources');

const serviceSpecsExpand = require('../../lib/service-specs-expand');
const stringifyPlus = require('../../lib/stringify-plus');
const { updateSpecs } = require('../../lib/specs');

const debug = makeDebug('generator-feathers-plus:main');
const EOL = '\n';
let generators;

// Abstract statements between .js and .ts
function abstractTs(specs) {
  const ifTs = specs.options.ts;
  const sc = specs.options.semicolons ? ';' : '';

  return {
    tplJsOrTs: (value, valueTs) => ifTs ? valueTs : value,
    tplJsOnly: lines => {
      lines = Array.isArray(lines) ? lines : [lines];

      return !ifTs ? lines.join(EOL) : '';
    },
    tplTsOnly: lines => {
      lines = Array.isArray(lines) ? lines : [lines];

      return ifTs ? lines.join(EOL) : '';
    },
    tplImports: (vars, module, format, useConst = 'const') => {
      if (!ifTs) return `${useConst} ${vars} = require('${module || vars}')${sc}`;

      // todo [removed] if (format === 'req') return `import ${vars} = require('${module || vars}')${sc}`;
      if (format === 'as') return `import * as ${vars} from '${module || vars}'${sc}`;
      return `import ${vars} from '${module || vars}'${sc}`;
    },
    tplModuleExports: (type, value = '{', valueTs) => {
      if (!ifTs) return `let moduleExports = ${value}`;

      if (type) return `let moduleExports: ${type} = ${valueTs || value}`;
      return `let moduleExports = ${valueTs || value}`;
    },
    tplExport: (value, valueTs) => {
      if (!ifTs) return `module.exports = ${value}`;

      return `export default ${valueTs || value}`;
    },
    tplNamedExport: (name, value, valueTs) => {
      if (!ifTs) return `module.exports.${name} = ${value}`;

      return `export const ${name} = ${valueTs || value}`;
    },
  };
}

module.exports = function generatorWriting (generator, what) {
  debug('generatorWriting() starts', what);

  // Update specs with answers to prompts.
  let { props, _specs: specs } = generator;
  updateSpecs(what, props, `${what} generator`);
  // Nothing to generate if "generate options"
  if (what === 'options') return;

  // Get unique generators which have been run.
  generators = [...new Set(specs._generators)].sort();
  debug('generators run=', generators);

  // Basic context used with templates.
  const context = new function () {
    // Expanded definitions.
    this.specs = specs;
    const { mapping, feathersSpecs } = serviceSpecsExpand(specs, generator);
    this.mapping = mapping;
    this.feathersSpecs = feathersSpecs;
    this.hasProvider = name => specs.app.providers.indexOf(name) !== -1;
    this.getNameSpace = str => generator.getNameSpace(str);

    // Paths.
    this.appConfigPath = specs.app.config || 'config';

    // TypeScript & semicolon helpers.
    this.js = specs.options.ts ? 'ts' : 'js';
    this.isJs = !specs.options.ts;
    this.sc = specs.options.semicolons ? ';' : '';

    // Abstract .js and .ts linting.
    this.lintRule = this.isJs ? 'eslint ' : 'tslint:';
    this.lintDisable = this.isJs ?  'eslint-disable' : 'tslint:disable';
    this.lintDisableUnused = this.isJs ? 'eslint-disable no-unused-vars' : 'tslint:disable no-unused-variable';
    this.lintDisableNextLine = this.isJs ?  'eslint-disable-next-line' : 'tslint:disable-next-line';
    this.lintDisableNextLineUnused = this.isJs ?
      'eslint-disable-next-line no-unused-vars' : 'tslint:disable-next-line:no-unused-variable';
    this.lintDisableNextLineNoConsole = this.isJs ?
      'eslint-disable-next-line no-console' : 'tslint:disable-next-line:no-console';
    this.ruleQuoteDisable = this.isJs ? 'quotes: 0' : 'disable:quotemark';

    // Abstract .js and .ts statements.
    const { tplJsOrTs, tplJsOnly, tplTsOnly, tplImports, tplModuleExports, tplExport } = abstractTs(specs);
    this.tplJsOrTs = tplJsOrTs;
    this.tplJsOnly = tplJsOnly;
    this.tplTsOnly = tplTsOnly;
    this.tplImports = tplImports;
    this.tplModuleExports = tplModuleExports;
    this.tplExport = tplExport;

    // lodash utilities.
    this.camelCase = camelCase;
    this.kebabCase = kebabCase;
    this.snakeCase = snakeCase;
    this.upperFirst = upperFirst;

    // Utilities.
    this.merge = merge;
    this.EOL = EOL;
    this.stringifyPlus = stringifyPlus;
  };

  // Variables used by individual "generate" modules.
  const state = new function () {
    // File writing functions.
    // type:   'tpl' - expand template, 'copy' - copy file, 'json' - write JSON as file.
    // src:    path & file of template or source file. Array of folder names or str.
    // obj:    Object to write as JSON.
    // dest:   path & file of destination. Array to .join() or str.
    // ifNew:  true: Write file only if it does not yet exist, false: always write it.
    // ifSkip: true: Do not write this file, false: write it.
    // ctx:    Extra content to call template with.
    // Note that frozen files are never written.
    this.tmpl = function tmpl (src, dest, ifNew, ifSkip, ctx) {
      return { type: 'tpl', src, dest, ifNew, ifSkip, ctx };
    };
    this.copy = function copy (src, dest, ifNew, ifSkip, ctx) {
      return { type: 'copy', src, dest, ifNew, ifSkip, ctx };
    };
    this.json = function json (obj, dest, ifNew, ifSkip, ctx) {
      return { type: 'json', obj, dest, ifNew, ifSkip, ctx };
    };
    this.source = function source (obj, dest, ifNew, ifSkip, ctx) {
      return { type: 'write', obj, dest, ifNew, ifSkip, ctx };
    };
    this.stripSlashes = function stripSlashes (name) {
      return name.replace(/^(\/*)|(\/*)$/g, '');
    };

    // Abbreviations for paths to templates used in building 'todos'.
    this.tpl = join(__dirname, 'templates');
    this.configPath = join(this.tpl, '_configs');
    this.src = specs.app.src;
    this.srcPath = join(this.tpl, 'src');
    this.mwPath = join(this.srcPath, 'middleware');
    this.serPath = join(this.srcPath, 'services');
    this.namePath = join(this.serPath, 'name');
    this.qlPath = join(this.serPath, 'graphql');
    this.testPath = join(this.tpl, 'test');

    // Other abbreviations using in building 'todos'.
    this.libDir = specs.app.src;
    this.testDir = generator.testDirectory;
    if (this.testDir.charAt(this.testDir.length - 1) === '/') {
      this.testDir = this.testDir.substring(0, this.testDir.length - 1);
    }

    // Utilities.
    this.generatorsInclude = function generatorsInclude (name) {
      return generators.indexOf(name) !== -1;
    };

    // Constants.
    this.WRITE_IF_NEW = true;
    this.WRITE_ALWAYS = false;
    this.SKIP_WRITE = true;
    this.DONT_SKIP_WRITE = false;

    return this;
  };

  // Dependency used by "generate service".
  const inject = { connection };

  // Generate what is needed.
  switch (what) {
    case 'all':
      if (!specs.app.name) { // specs.js adds default props to specs.app
        generator.log('\nfeathers-gen-specs.json does not contain an \'app\' property. Terminating.');
        break;
      }

      app(generator, props, specs, context, state);

      Object.keys(specs.services || {}).forEach(name => {
        service(generator, name, props, specs, context, state, inject);
      });

      Object.keys(specs.hooks || {}).forEach(name => {
        hook(generator, name, props, specs, context, state);

        props.testType = 'hookUnit';
        props.hookName = name;
        test(generator, props, specs, context, state);
      });

      authentication(generator, true, props, specs, context, state);

      connection(generator, props, specs, context, state);

      middleware(generator, props, specs, context, state);

      if (specs.graphql &&
        (Object.keys(context.mapping.graphqlService).length || Object.keys(context.mapping.graphqlSql).length)
      ) {
        graphql(generator, props, specs, context, state);
      }

      if (process.env.fakes) {
        fakes(generator, props, specs, context, state);
      }

      resources(generator, props, specs, context, state);

      break;
    case 'app':
      app(generator, props, specs, context, state);
      break;
    case 'service':
      service(generator, props.name, props, specs, context, state, inject);

      // "generate authentication" from the prompt will generate the wrong path for
      // the user-entity because of a chicken-and-egg problem. This fixes it.
      if (specs.services[props.name].isAuthEntity) {
        authentication(generator, true, props, specs, context, state);
      }
      break;
    case 'hook':
      hook(generator, props.name, props, specs, context, state);
      app(generator, props, specs, context, state);

      props.testType = 'hookUnit';
      props.hookName = props.name;
      test(generator, props, specs, context, state);

      Object.keys(specs.services || {}).forEach(name => {
        service(generator, name, props, specs, context, state, inject);
      });
      break;
    case 'connection':
      connection(generator, props, specs, context, state);
      break;
    case 'authentication':
      authentication(generator, false, props, specs, context, state);
      break;
    case 'middleware':
      middleware(generator, props, specs, context, state);
      break;
    case 'graphql':
      graphql(generator, props, specs, context, state);
      break;
    case 'fakes':
      fakes(generator, props, specs, context, state);
      break;
    case 'test':
      test(generator, props, specs, context, state);
      break;
    default:
      throw new Error(`Unexpected generate ${what}. (writing`);
  }

  debug('generatorWriting() ended');
};
