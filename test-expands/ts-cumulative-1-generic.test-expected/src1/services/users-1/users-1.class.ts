
// Class for the custom service `users1` on path `/users-1`. (Can be re-generated.)
/* tslint:disable no-unused-variable */

import { App } from '../../app.interface';
import { Id, NullableId, Paginated, Params, ServiceMethods, SetupMethod } from '@feathersjs/feathers';
// !code: imports // !end
// !code: init // !end

// !<DEFAULT> code: interface
// tslint:disable-next-line no-empty-interface
interface ServiceOptions {}
// !end

export class Service implements Partial<ServiceMethods<any>>, SetupMethod {
  // !<DEFAULT> code: properties
  app!: App;
  // !end

  constructor (private options: ServiceOptions = {}) {
    // !code: constructor1 // !end
  }

  // !<DEFAULT> code: setup
  setup (app: App, path: string): void {
    this.app = app;
  }
  // !end

  // !<DEFAULT> code: find
  async find(params?: Params): Promise<any[] | Paginated<any>> {
    return [];
  }
  // !end

  // !<DEFAULT> code: get
  async get (id: Id, params?: Params): Promise<any> {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }
  // !end

  // !<DEFAULT> code: create
  async create (data: Partial<any> | Array<Partial<any>>, params?: Params): Promise<any> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }
  // !end

  // !<DEFAULT> code: update
  async update (id: NullableId, data: any, params?: Params): Promise<any> {
    return data;
  }
  // !end

  // !<DEFAULT> code: patch
  async patch (id: NullableId, data: Partial<any>, params?: Params): Promise<any> {
    return data;
  }
  // !end

  // !<DEFAULT> code: remove
  async remove (id: NullableId, params?: Params): Promise<any> {
    return { id };
  }
  // !end
  // !code: more // !end
}

export default function (options: ServiceOptions) {
  return new Service(options);
};

// !code: funcs // !end
// !code: end // !end
