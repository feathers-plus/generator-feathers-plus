
// Class for the custom service `users1` on path `/users-1`. (Can be re-generated.)
/* eslint-disable no-unused-vars */

// !code: imports // !end
// !code: init // !end

class Service {
  constructor (options) {
    this.options = options || {};
    // !code: constructor1 // !end
  }

  // !<DEFAULT> code: find
  async find (params) {
    return [];
  }
  // !end

  // !<DEFAULT> code: get
  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }
  // !end

  // !<DEFAULT> code: create
  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }
  // !end

  // !<DEFAULT> code: update
  async update (id, data, params) {
    return data;
  }
  // !end

  // !<DEFAULT> code: patch
  async patch (id, data, params) {
    return data;
  }
  // !end

  // !<DEFAULT> code: remove
  async remove (id, params) {
    return { id };
  }
  // !end
  // !code: more // !end
}

const moduleExports = function (options) {
  return new Service(options);
};

moduleExports.Service = Service;

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
