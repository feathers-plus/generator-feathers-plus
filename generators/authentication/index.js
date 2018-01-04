const _ = require('lodash');
const crypto = require('crypto');

const Generator = require('../../lib/generator');
const generatorFs = require('../../lib/generator-fs');
const specsExpand = require('../../lib/specs-expand');
const { refreshCodeFragments } = require('../../lib/code-fragments');
const { updateSpecs } = require('../../lib/specs');

const OAUTH2_STRATEGY_MAPPINGS = {
  auth0: 'passport-auth0',
  google: 'passport-google-oauth20',
  facebook: 'passport-facebook',
  github: 'passport-github'
};

module.exports = class AuthGenerator extends Generator {
  async initializing() {
    this.fragments = await refreshCodeFragments();
  }

  prompting() {
    const { props, _specs: specs } = this;
    let serviceSpecs;
    this.checkPackage();

    const prompts = [{
      type: 'checkbox',
      name: 'strategies',
      message: 'What authentication providers do you want to use? Other PassportJS strategies not in this list can still be configured manually.',
      default: 'providers',
      choices: [
        {
          name: 'Username + Password (Local)',
          value: 'local',
          checked: true
        }, {
          name: 'Auth0',
          value: 'auth0'
        }, {
          name: 'Google',
          value: 'google'
        }, {
          name: 'Facebook',
          value: 'facebook'
        }, {
          name: 'GitHub',
          value: 'github'
        }]
    }, {
      name: 'entity',
      message: 'What is the name of the user (entity) service?',
      default: 'users'
    }];

    return this.prompt(prompts).then(props1 => {
      this.props = Object.assign(props, props1);

      this.logSteps && console.log('>>>>> authentication generator finished prompting()');
    });
  }

  _writeConfiguration(context) {
    const config = Object.assign({}, this.defaultConfig);

    config.authentication = {
      secret: crypto.randomBytes(256).toString('hex'),
      strategies: [ 'jwt' ],
      path: '/authentication',
      service: context.kebabEntity,
      jwt: {
        header: { typ: 'access' },
        audience: 'https://yourdomain.com',
        subject: 'anonymous',
        issuer: 'feathers',
        algorithm: 'HS256',
        expiresIn: '1d'
      }
    };

    if (context.strategies.indexOf('local') !== -1) {
      config.authentication.strategies.push('local');
      config.authentication.local = {
        entity: 'user',
        usernameField: 'email',
        passwordField: 'password'
      };
    }

    let includesOAuth = false;

    context.strategies.forEach(strategy => {
      if (OAUTH2_STRATEGY_MAPPINGS[strategy]) {
        const strategyConfig = {
          clientID: `your ${strategy} client id`,
          clientSecret: `your ${strategy} client secret`,
          successRedirect: '/'
        };
        includesOAuth = true;

        if(strategy === 'auth0') {
          strategyConfig.domain = 'mydomain.auth0.com';
        }

        if (strategy === 'facebook') {
          strategyConfig.scope = ['public_profile', 'email'];
          strategyConfig.profileFields = ['id', 'displayName', 'first_name', 'last_name', 'email', 'gender', 'profileUrl', 'birthday', 'picture', 'permissions'];
        }

        if (strategy === 'google') {
          strategyConfig.scope = ['profile openid email'];
        }

        config.authentication[strategy] = strategyConfig;
      }
    });

    if (includesOAuth) {
      config.authentication.cookie = {
        enabled: true,
        name: 'feathers-jwt',
        httpOnly: false,
        secure: false
      };
    }

    // todo this.conflicter.force = true;
    this.fs.writeJSON(
      this.destinationPath('config', 'default.json'),
      config
    );
  }

  writing() {
    const generator = this;
    generator.logSteps && console.log('>>>>> authentication generator started writing()');

    const { props, _specs: specs } = generator;

    const dependencies = [
      '@feathersjs/authentication',
      '@feathersjs/authentication-jwt'
    ];

    const context = Object.assign(
      props,
      {
        specs,
        kebabEntity: _.kebabCase(props.entity),
        camelEntity: _.camelCase(props.entity),
        oauthProviders: [],
        hasProvider (name) { return specs.app.providers.indexOf(name) !== -1; }
      },
    );

    // Set up strategies and add dependencies
    props.strategies.forEach(strategy => {
      const oauthProvider = OAUTH2_STRATEGY_MAPPINGS[strategy];

      if (oauthProvider) {
        dependencies.push('@feathersjs/authentication-oauth2');
        dependencies.push(oauthProvider);
        context.oauthProviders.push({
          name: strategy,
          strategyName: `${_.upperFirst(strategy)}Strategy`,
          module: oauthProvider
        });
      } else {
        dependencies.push(`@feathersjs/authentication-${strategy}`);
      }
    });

    // Create the users service
    generator.composeWith(require.resolve('../service'), {
      props: {
        name: context.entity,
        path: `/${context.kebabEntity}`,
        authentication: context
      }
    });

    updateSpecs('authentication', props, 'service generator');
    //specsExpand(specs);

    // Common abbreviations for building 'todos'.
    const src = specs.app.src;
    const libDir = generator.libDirectory;
    const testDir = generator.testDirectory;
    const shared = 'templates-shared';
    const js = specs.options.configJs;

    const todos = [
      // Files rewritten every (re)generation.
      { type: 'tpl',  src: 'authentication.ejs', dest: [libDir, 'authentication.js'] },
      { type: 'tpl',  src: ['..', '..', shared, 'src.app.ejs'], dest: [src, 'app.js'] },
    ];

    generatorFs(generator, context, todos);

    generator._writeConfiguration(context);
    generator._packagerInstall(dependencies, {
      save: true
    });

    generator.logSteps && console.log('>>>>> authentication generator finished writing'/*, todos.map(todo => todo.src || todo.obj)*/);
  }

  install () {
    this.logSteps && console.log('>>>>> authentication generator finished install()');
  }

  end () {
    this.logSteps && console.log('>>>>> authentication generator finished end()');
  }
};
