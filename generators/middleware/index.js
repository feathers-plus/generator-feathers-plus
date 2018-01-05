const { kebabCase, camelCase } = require('lodash');
const j = require('@feathersjs/tools').transform;
const Generator = require('../../lib/generator');

const generatorFs = require('../../lib/generator-fs');
const { refreshCodeFragments } = require('../../lib/code-fragments');
const { initSpecs, updateSpecs } = require('../../lib/specs');

const generatorWriting = require('../writing');

module.exports = class MiddlewareGenerator extends Generator {
  async initializing() {
    this.fragments = await refreshCodeFragments();
  }

  prompting () {
    this.checkPackage();
    const { props, _specs: specs } = this;

    const prompts = [
      {
        name: 'name',
        message: 'What is the name of the Express middleware?'
      },
      {
        name: 'path',
        message: 'What is the mount path?',
        default: '*'
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props, {
        kebabName: kebabCase(props.name),
        camelName: camelCase(props.name)
      });

      initSpecs('middleware', props);
      this.logSteps && console.log('>>>>> middleware generator finished prompting()');
    });
  }

  // We generate all the defined middlewares, not just the current one.
  writing () {
    generatorWriting(this, 'middleware');
    /*
    const generator = this;
    generator.logSteps && console.log('>>>>> middleware generator started writing()');

    const { props, _specs: specs } = generator;

    const context = Object.assign({},
      props,
      { specs },
    );

    updateSpecs('middlewares', props, 'middleware generator');

    // Common abbreviations for building 'todos'.
    const src = specs.app.src;
    const libDir = generator.libDirectory;
    const testDir = generator.testDirectory;
    const shared = 'templates-shared';
    const js = specs.options.configJs;
    // Custom abbreviations.

    const todos = [
      // Files which are written only if they don't exist. They are never rewritten.
      //{ type: 'tpl',  src: 'middleware.ejs', dest: [libDir, 'middleware', `${context.kebabName}.js`], ifNew: true },

      // Files rewritten every (re)generation.
      { type: 'tpl',  src: ['..', '..', shared, 'middleware.index.ejs'], dest: [src, 'middleware', 'index.js'] },
    ];

    Object.keys(specs.middlewares).sort().forEach(mwName => {
      const fileName = specs.middlewares[mwName].kebab;
      todos.push(
        { type: 'tpl',  src: 'middleware.ejs', dest: [libDir, 'middleware', `${fileName}.js`], ifNew: true, ctx: { mwName } },
      );
    });

    generatorFs(generator, context, todos);
    */
  }
};
