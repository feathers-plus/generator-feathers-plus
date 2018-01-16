const semver = require('semver');

module.exports = function(generator) {
  const major = semver.major(process.version);
  const { props, _specs: specs } = generator;
  const lib = props.src;
  const [ packager, version ] = specs.app.packager.split('@');
  const pkg = {
    name: specs.app.name,
    description: specs.app.description,
    version: '0.0.0',
    homepage: '',
    main: specs.app.src,
    keywords: [
      'feathers'
    ],
    author: {
      name: generator.user.git.name(),
      email: generator.user.git.email()
    },
    contributors: [],
    bugs: {},
    directories: {
      lib: specs.app.src,
      test: 'test/'
    },
    engines: {
      node: `^${major}.0.0`,
      [packager]: version
    },
    'scripts': {
      test: `${packager} run eslint && ${packager} run mocha`,
      eslint: `eslint ${specs.app.src}/. test/. --config .eslintrc.json`,
      start: `node ${specs.app.src}/`,
      mocha: 'mocha test/ --recursive --exit'
    }
  };

  return pkg;
};
