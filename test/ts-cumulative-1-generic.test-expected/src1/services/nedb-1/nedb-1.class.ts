
// Class for the custom service `nedb1` on path `/nedb-1`. (Can be re-generated.)
/* tslint:disable no-unused-variable */
import { App } from '../../app.interface';

// !code: imports // !end
// !code: init // !end

class Service {
  constructor (options) {
    this.options = options || {};
    // !code: constructor // !end
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
      return await Promise.all(data.map(current => this.create(current)));
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
}

export default function (options) {
  return new Service(options);
};

export Service = Service;
// !code: funcs // !end
// !code: end // !end
