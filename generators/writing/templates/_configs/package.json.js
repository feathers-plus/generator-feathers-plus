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
    scripts: {}
  };

  pkg.scripts = Object.assign(pkg.scripts, specs.options.ts ? {
    test: 'npm run tslint && npm run mocha',
    tslint: 'tslint -p tsconfig.json -c tslint.json && tslint -p tsconfig.test.json -c tslint.json',
    start: `ts-node --files ${specs.app.src}/`,
    mocha: 'ts-mocha -p tsconfig.test.json "test/**/*.test.ts" --timeout 10000 --exit',
    compile: 'tsc -p tsconfig.json',
  } : {
    test: `${packager} run eslint && ${packager} run mocha`,
    eslint: `eslint ${specs.app.src}/. test/. --config .eslintrc.json`,
    start: `node ${specs.app.src}/`,
    mocha: 'mocha test/ --recursive --exit --timeout 10000'
  });

  return pkg;
};
