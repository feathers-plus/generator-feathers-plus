
const assert = require('assert');
const app = require('../../../src/app');

const SERVICE_NAME = 'posts';
const serviceMethods = {
  f: 'find',
  g: 'get',
  c: 'create',
  u: 'update',
  p: 'patch',
  r: 'remove',
};

// Sample database
const testDatabase = [
  { body: 'foo1' },
  { body: 'foo2' },
  { body: 'foo3' },
  { body: 'foo4' },
  { body: 'foo5' },
];

// convenience method to create roles
function ro(serviceName, methods) {
  const rolesArray = methods.split('').map(
    method => `${serviceName || SERVICE_NAME}::${serviceMethods[method]}`
  );

  return rolesArray.join(',');
}

// Determine if environment allows test to mutate existing DB data.
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.log('SKIPPED - Test posts/posts.service.permissions.test.js');

  return;
}

describe('Test posts/posts.service.permissions.test.js', () => {
  describe('Role Based Access Control', () => {
    let ids;

    /* eslint-disable */
    const john = () => ({ name: 'John', password: 'secret' });

    const decisionTable = [
      // .server calls
      // ..find
      // user, isAuth, roles,         provider,   method,   id, errCode
      [john(), true,   ro('', 'c'),   undefined,  'find',   0,  null ],
      [john(), true,   ro('', 'r'),   undefined,  'find',   0,  null ],
      [john(), false,  ro('', 'cur'), undefined,  'find',   0,  null ],
      [john(), false,  ro('', 'gur'), undefined,  'find',   0,  null ],
      // ..get
      [john(), true,   ro('', 'cur'), undefined,  'get',     0,  null ],
      [john(), true,   ro('', 'gur'), undefined,  'get',     0,  null ],
      [john(), false,  ro('', 'cur'), undefined,  'get',     0,  null ],
      [john(), false,  ro('', 'gur'), undefined,  'get',     0,  null ],
      // ..create
      [john(), true,   ro('', 'cur'), undefined,  'create', 0,  null ],
      [john(), true,   ro('', 'gur'), undefined,  'create', 0,  null ],
      [john(), false,  ro('', 'cur'), undefined,  'create', 0,  null ],
      [john(), false,  ro('', 'gur'), undefined,  'create', 0,  null ],
      // ..update
      [john(), true,   ro('', 'cur'), undefined,  'update', 0,  null ],
      [john(), true,   ro('', 'gur'), undefined,  'update', 0,  null ],
      [john(), false,  ro('', 'cur'), undefined,  'update', 0,  null ],
      [john(), false,  ro('', 'gur'), undefined,  'update', 0,  null ],
      // ..patch
      [john(), true,   ro('', 'cur'), undefined,  'patch',  0,  null ],
      [john(), true,   ro('', 'gur'), undefined,  'patch',  0,  null ],
      [john(), false,  ro('', 'cur'), undefined,  'patch',  0,  null ],
      [john(), false,  ro('', 'gur'), undefined,  'patch',  0,  null ],
      // ..remove
      [john(), true,   ro('', 'cur'), undefined,  'remove',  0,  null ],
      [john(), true,   ro('', 'gur'), undefined,  'remove',  0,  null ],
      [john(), false,  ro('', 'cur'), undefined,  'remove',  0,  null ],
      [john(), false,  ro('', 'gur'), undefined,  'remove',  0,  null ],

      // .REST calls
      // ..find
      // user, isAuth, roles,         provider,   method,   id, errCode
      [john(), true,   ro('', 'f'),   'rest',     'find',   0,  null ],
      [john(), true,   ro('', 'r'),   'rest',     'find',   0,  403  ],
      [john(), false,  ro('', 'fur'), 'rest',     'find',   0,  403  ],
      [john(), false,  ro('', 'gur'), 'rest',     'find',   0,  403  ],
      // ..get
      [john(), true,   ro('', 'gur'), 'rest',     'get',    0,  null ],
      [john(), true,   ro('', 'uur'), 'rest',     'get',    0,  403  ],
      [john(), false,  ro('', 'gur'), 'rest',     'get',    0,  403  ],
      [john(), false,  ro('', 'uur'), 'rest',     'get',    0,  403  ],
      // ..create
      [john(), true,   ro('', 'cur'), 'rest',     'create', 0,  null ],
      [john(), true,   ro('', 'gur'), 'rest',     'create', 0,  403  ],
      [john(), false,  ro('', 'cur'), 'rest',     'create', 0,  403  ],
      [john(), false,  ro('', 'gur'), 'rest',     'create', 0,  403  ],
      // ..update
      [john(), true,   ro('', 'cur'), 'rest',     'update', 0,  null ],
      [john(), true,   ro('', 'ggr'), 'rest',     'update', 0,  403  ],
      [john(), false,  ro('', 'cur'), 'rest',     'update', 0,  403  ],
      [john(), false,  ro('', 'ggr'), 'rest',     'update', 0,  403  ],
      // ..patch
      [john(), true,   ro('', 'cpr'), 'rest',     'patch',  0,  null ],
      [john(), true,   ro('', 'gur'), 'rest',     'patch',  0,  403  ],
      [john(), false,  ro('', 'cpr'), 'rest',     'patch',  0,  403  ],
      [john(), false,  ro('', 'gur'), 'rest',     'patch',  0,  403  ],
      // ..remove
      [john(), true,   ro('', 'cur'), 'rest',     'remove', 0,  null ],
      [john(), true,   ro('', 'gup'), 'rest',     'remove', 0,  403  ],
      [john(), false,  ro('', 'cur'), 'rest',     'remove', 0,  403  ],
      [john(), false,  ro('', 'gup'), 'rest',     'remove', 0,  403  ],

      // .Socket.io calls
      // ..find
      // user, isAuth, roles,         provider,   method,   id, errCode
      [john(), true,   ro('', 'f'),   'socketio', 'find',   0,  null ],
      [john(), true,   ro('', 'r'),   'socketio', 'find',   0,  403  ],
      [john(), false,  ro('', 'fur'), 'socketio', 'find',   0,  403  ],
      [john(), false,  ro('', 'gur'), 'socketio', 'find',   0,  403  ],
      // ..get
      [john(), true,   ro('', 'gur'), 'socketio', 'get',    0,  null ],
      [john(), true,   ro('', 'uur'), 'socketio', 'get',    0,  403  ],
      [john(), false,  ro('', 'gur'), 'socketio', 'get',    0,  403  ],
      [john(), false,  ro('', 'uur'), 'socketio', 'get',    0,  403  ],
      // ..create
      [john(), true,   ro('', 'cur'), 'socketio', 'create', 0,  null ],
      [john(), true,   ro('', 'gur'), 'socketio', 'create', 0,  403  ],
      [john(), false,  ro('', 'cur'), 'socketio', 'create', 0,  403  ],
      [john(), false,  ro('', 'gur'), 'socketio', 'create', 0,  403  ],
      // ..update
      [john(), true,   ro('', 'cur'), 'socketio', 'update', 0,  null ],
      [john(), true,   ro('', 'ggr'), 'socketio', 'update', 0,  403  ],
      [john(), false,  ro('', 'cur'), 'socketio', 'update', 0,  403  ],
      [john(), false,  ro('', 'ggr'), 'socketio', 'update', 0,  403  ],
      // ..patch
      [john(), true,   ro('', 'cpr'), 'socketio', 'patch',  0,  null ],
      [john(), true,   ro('', 'gur'), 'socketio', 'patch',  0,  403  ],
      [john(), false,  ro('', 'cpr'), 'socketio', 'patch',  0,  403  ],
      [john(), false,  ro('', 'gur'), 'socketio', 'patch',  0,  403  ],
      // ..remove
      [john(), true,   ro('', 'cur'), 'socketio', 'remove', 0,  null ],
      [john(), true,   ro('', 'gup'), 'socketio', 'remove', 0,  403  ],
      [john(), false,  ro('', 'cur'), 'socketio', 'remove', 0,  403  ],
      [john(), false,  ro('', 'gup'), 'socketio', 'remove', 0,  403  ],

      // .primus calls
      // ..find
      // user, isAuth, roles,         provider,   method,   id, errCode
      [john(), true,   ro('', 'f'),   'primus',   'find',   0,  null ],
      [john(), true,   ro('', 'r'),   'primus',   'find',   0,  403  ],
      [john(), false,  ro('', 'fur'), 'primus',   'find',   0,  403  ],
      [john(), false,  ro('', 'gur'), 'primus',   'find',   0,  403  ],
      // ..get
      [john(), true,   ro('', 'gur'), 'primus',   'get',    0,  null ],
      [john(), true,   ro('', 'uur'), 'primus',   'get',    0,  403  ],
      [john(), false,  ro('', 'gur'), 'primus',   'get',    0,  403  ],
      [john(), false,  ro('', 'uur'), 'primus',   'get',    0,  403  ],
      // ..create
      [john(), true,   ro('', 'cur'), 'primus',   'create', 0,  null ],
      [john(), true,   ro('', 'gur'), 'primus',   'create', 0,  403  ],
      [john(), false,  ro('', 'cur'), 'primus',   'create', 0,  403  ],
      [john(), false,  ro('', 'gur'), 'primus',   'create', 0,  403  ],
      // ..update
      [john(), true,   ro('', 'cur'), 'primus',   'update', 0,  null ],
      [john(), true,   ro('', 'ggr'), 'primus',   'update', 0,  403  ],
      [john(), false,  ro('', 'cur'), 'primus',   'update', 0,  403  ],
      [john(), false,  ro('', 'ggr'), 'primus',   'update', 0,  403  ],
      // ..patch
      [john(), true,   ro('', 'cpr'), 'primus',   'patch',  0,  null ],
      [john(), true,   ro('', 'gur'), 'primus',   'patch',  0,  403  ],
      [john(), false,  ro('', 'cpr'), 'primus',   'patch',  0,  403  ],
      [john(), false,  ro('', 'gur'), 'primus',   'patch',  0,  403  ],
      // ..remove
      [john(), true,   ro('', 'cur'), 'primus',   'remove', 0,  null ],
      [john(), true,   ro('', 'gup'), 'primus',   'remove', 0,  403  ],
      [john(), false,  ro('', 'cur'), 'primus',   'remove', 0,  403  ],
      [john(), false,  ro('', 'gup'), 'primus',   'remove', 0,  403  ],
    ];
    /* eslint-enable */

    beforeEach(async () => {
      await app.service(SERVICE_NAME).remove(null);
      const recs = await app.service(SERVICE_NAME).create(testDatabase);
      ids = recs.map(rec => rec.id || rec._id);
    });

    decisionTable.forEach(([user, isAuth, roles, provider, method, id, errCode]) => {
      const testDesc = `${provider ? provider : 'server'}, ${method}${method !== 'create' ? `, ${id}` : ''}, ${isAuth ? ' auth' : '!auth'}, ${roles}`;

      it(testDesc, async () => {
        const params = { provider };
        if (isAuth) {
          params.user = user;
          params.user.roles = (roles || '').split(',');
        }

        try {
          switch (method) {
          case 'find':
            await app.service(SERVICE_NAME).find(ids[id], params);
            break;
          case 'get':
            await app.service(SERVICE_NAME).get(ids[id], params);
            break;
          case 'create':
            await app.service(SERVICE_NAME).create({ body: 'foo' }, params);
            break;
          case 'update':
            await app.service(SERVICE_NAME).update(ids[id], { body: 'bar' }, params);
            break;
          case 'patch':
            await app.service(SERVICE_NAME).patch(ids[id], { body: 'bar' }, params);
            break;
          case 'remove':
            await app.service(SERVICE_NAME).remove(ids[id], params);
            break;
          }

          if (errCode) {
            assert(false, 'unexpected succeeded');
          }
        } catch(err) {
          if (err.message === 'unexpected succeeded') return err;

          if (!errCode) {
            assert(false, `unexpected failed: ${err.message}`);
            return;
          }

          assert.strictEqual(err.code, errCode, `unexpected error: ${err.message}`);
        }
      });
    });
  });
});
