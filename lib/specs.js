
const { writeFileSync } = require('fs');

module.exports = {
  initSpecs,
  updateSpecs,
};

function initSpecs(specs, what, info) {
  switch(what) {
    case 'app':
      specs.app = specs.app || {};
      return;
    case 'services':
      specs.services = specs.services || {};
      specs.services[info.name] = specs.services[info.name] || {};
      return;
  }
}

function updateSpecs(path, specs, what, props) {
  switch(what) {
    case 'app':
      specs.app = specs.app || {};
      specs.app.src = props.src;
      specs.app.packager = props.packager;
      specs.app.providers = props.providers;

      return writeFileSync(path, JSON.stringify(specs, null, 2));
  }
}

// feathers-plus generator config
const genConfig = {
  backups: true,
  inserts: true,
};

// Sample application spec
const sampleSpec = {
  app: {
    //name: pkg.name,
    //desc: pkg.description,
    src: 'src',
    providers: ['rest', 'socketio'],
    packager: 'npm@>= 3.0.0',
  },
  services: {},
};
