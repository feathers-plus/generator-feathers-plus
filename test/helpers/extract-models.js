
// Given specs and JSON-schema from services, log the models generated for each service.
const { assert }= require('chai');
const mongoose = require('mongoose');
const Sequelize = require('sequelize');
const traverse = require('traverse');
const { inspect } = require('util');
const serviceSpecsExpand = require('../../lib/service-specs-expand');
const serviceSpecsToTypescript = require('../../lib/service-specs-to-typescript');
const serviceSpecsToMongoJsonSchema = require('../../lib/service-specs-to-mongo-json-schema');
const serviceSpecsToMongoose = require('../../lib/service-specs-to-mongoose');
const serviceSpecsToSequelize = require('../../lib/service-specs-to-sequelize');
const stringifyPlus = require('../../lib/stringify-plus');

const mongooseNativeFuncs = {
  [mongoose.Schema.Types.Mixed]: 'mongoose.Schema.Types.Mixed',
  [mongoose.Schema.Types.ObjectId]: 'mongoose.Schema.Types.ObjectId'
};

let sequelizeNativeFuncs = {
  [Sequelize.BOOLEAN]: 'sequelizeTypeEquivalences.boolean',
  [Sequelize.ENUM]: 'sequelizeTypeEquivalences.enum',
  [Sequelize.INTEGER]: 'sequelizeTypeEquivalences.integer',
  [Sequelize.JSONB]: 'sequelizeTypeEquivalences.jsonb',
  [Sequelize.REAL]: 'sequelizeTypeEquivalences.real',
  [Sequelize.STRING]: 'sequelizeTypeEquivalences.string',
  [Sequelize.TEXT]: 'sequelizeTypeEquivalences.text',
  [Sequelize.DATE]: 'sequelizeTypeEquivalences.date',
  [Sequelize.DATEONLY]: 'sequelizeTypeEquivalences.dateonly',
};

const specs = {
  "options": {
    "ver": "1.0.0",
    "inspectConflicts": false,
    "semicolons": false,
    "freeze": [
      "src/app.js"
    ],
    "ts": false
  },
  "app": {
    "environmentsAllowingSeedData": "development,test",
    "seedData": true,
    "name": "rovit-api",
    "description": "Project rovit-api",
    "src": "src",
    "packager": "npm@>= 3.0.0",
    "providers": [
      "rest",
      "socketio"
    ]
  },
  "services": {
    "users": {
      "name": "users",
      "nameSingular": "user",
      "subFolder": "v1",
      "fileName": "users",
      "adapter": "mongoose",
      "path": "/users",
      "isAuthEntity": true,
      "requiresAuth": true,
      "graphql": true
    },
    "clientUsers": {
      "name": "clientUsers",
      "nameSingular": "clientUser",
      "subFolder": "v1",
      "fileName": "client-users",
      "adapter": "mongoose",
      "path": "/client-users",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "businesses": {
      "name": "businesses",
      "nameSingular": "business",
      "subFolder": "v1",
      "fileName": "businesses",
      "adapter": "mongoose",
      "path": "/businesses",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "categories": {
      "name": "categories",
      "nameSingular": "category",
      "subFolder": "v1",
      "fileName": "categories",
      "adapter": "mongoose",
      "path": "/categories",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "clients": {
      "name": "clients",
      "nameSingular": "client",
      "subFolder": "v1",
      "fileName": "clients",
      "adapter": "mongoose",
      "path": "/clients",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "config": {
      "name": "config",
      "nameSingular": "config",
      "subFolder": "v1",
      "fileName": "config",
      "adapter": "mongoose",
      "path": "/config",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "envPanos": {
      "name": "envPanos",
      "nameSingular": "envPano",
      "subFolder": "v1",
      "fileName": "env-panos",
      "adapter": "mongoose",
      "path": "/env-panos",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "environments": {
      "name": "environments",
      "nameSingular": "environment",
      "subFolder": "v1",
      "fileName": "environments",
      "adapter": "mongoose",
      "path": "/environments",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "faqs": {
      "name": "faqs",
      "nameSingular": "faq",
      "subFolder": "v1",
      "fileName": "faqs",
      "adapter": "mongoose",
      "path": "/faqs",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "hotspotIcons": {
      "name": "hotspotIcons",
      "nameSingular": "hotspotIcon",
      "subFolder": "v1",
      "fileName": "hotspot-icons",
      "adapter": "mongoose",
      "path": "/hotspot-icons",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "infoboxMedia": {
      "name": "infoboxMedia",
      "nameSingular": "infoboxMedia",
      "subFolder": "v1",
      "fileName": "infobox-media",
      "adapter": "mongoose",
      "path": "/infobox-media",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "infoboxTypes": {
      "name": "infoboxTypes",
      "nameSingular": "infoboxType",
      "subFolder": "v1",
      "fileName": "infobox-types",
      "adapter": "mongoose",
      "path": "/infobox-types",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "infoboxVideos": {
      "name": "infoboxVideos",
      "nameSingular": "infoboxVideo",
      "subFolder": "v1",
      "fileName": "infobox-videos",
      "adapter": "mongoose",
      "path": "/infobox-videos",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "infoboxes": {
      "name": "infoboxes",
      "nameSingular": "infobox",
      "subFolder": "v1",
      "fileName": "infoboxes",
      "adapter": "mongoose",
      "path": "/infoboxes",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "panoHotspots": {
      "name": "panoHotspots",
      "nameSingular": "panoHotspot",
      "subFolder": "v1",
      "fileName": "pano-hotspots",
      "adapter": "mongoose",
      "path": "/pano-hotspots",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "panos": {
      "name": "panos",
      "nameSingular": "pano",
      "subFolder": "v1",
      "fileName": "panos",
      "adapter": "mongoose",
      "path": "/panos",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "salesLeads": {
      "name": "salesLeads",
      "nameSingular": "salesLead",
      "subFolder": "v1",
      "fileName": "sales-leads",
      "adapter": "mongoose",
      "path": "/sales-leads",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "salesNotes": {
      "name": "salesNotes",
      "nameSingular": "salesNote",
      "subFolder": "v1",
      "fileName": "sales-notes",
      "adapter": "mongoose",
      "path": "/sales-notes",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "statViews": {
      "name": "statViews",
      "nameSingular": "statView",
      "subFolder": "v1",
      "fileName": "stat-views",
      "adapter": "mongoose",
      "path": "/stat-views",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "tags": {
      "name": "tags",
      "nameSingular": "tag",
      "subFolder": "v1",
      "fileName": "tags",
      "adapter": "mongoose",
      "path": "/tags",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "tourMenuItems": {
      "name": "tourMenuItems",
      "nameSingular": "tourMenuItem",
      "subFolder": "v1",
      "fileName": "tour-menu-items",
      "adapter": "mongoose",
      "path": "/tour-menu-items",
      "isAuthEntity": false,
      "requiresAuth": true,
      "graphql": true
    },
    "vr": {
      "name": "vr",
      "nameSingular": "vr",
      "subFolder": "v1",
      "fileName": "vr",
      "adapter": "generic",
      "path": "/vr",
      "isAuthEntity": false,
      "requiresAuth": false,
      "graphql": true
    },
    "mapPoints": {
      "name": "mapPoints",
      "nameSingular": "mapPoint",
      "subFolder": "v1",
      "fileName": "map-points",
      "adapter": "generic",
      "path": "/map-points",
      "isAuthEntity": false,
      "requiresAuth": false,
      "graphql": true
    },
    "xmlCache": {
      "name": "xmlCache",
      "nameSingular": "xmlCache",
      "subFolder": "v1",
      "fileName": "xml-cache",
      "adapter": "memory",
      "path": "/xml-cache",
      "isAuthEntity": false,
      "requiresAuth": false,
      "graphql": true
    }
  },
  "hooks": {
    "stash-populate": {
      "fileName": "stash-populate",
      "camelName": "stashPopulate",
      "ifMulti": "y",
      "multiServices": [
        "clientUsers"
      ],
      "singleService": ""
    },
    "calculate-infobox-bubbles": {
      "fileName": "calculate-infobox-bubbles",
      "camelName": "calculateInfoboxBubbles",
      "ifMulti": "n",
      "multiServices": [],
      "singleService": "envPanos"
    },
    "load-target-env-panos": {
      "fileName": "load-target-env-panos",
      "camelName": "loadTargetEnvPanos",
      "ifMulti": "n",
      "multiServices": [],
      "singleService": "envPanos"
    },
    "benchmark": {
      "fileName": "benchmark",
      "camelName": "benchmark",
      "ifMulti": "y",
      "multiServices": [
        "*none"
      ],
      "singleService": ""
    },
    "map-by-attr": {
      "fileName": "map-by-attr",
      "camelName": "mapByAttr",
      "ifMulti": "y",
      "multiServices": [
        "environments"
      ],
      "singleService": ""
    },
    "remove-related-records": {
      "fileName": "remove-related-records",
      "camelName": "removeRelatedRecords",
      "ifMulti": "y",
      "multiServices": [
        "infoboxes"
      ],
      "singleService": ""
    },
    "calculate-coordinates": {
      "fileName": "calculate-coordinates",
      "camelName": "calculateCoordinates",
      "ifMulti": "n",
      "multiServices": [],
      "singleService": "panoHotspots"
    },
    "sanitize-pano-hotspots": {
      "fileName": "sanitize-pano-hotspots",
      "camelName": "sanitizePanoHotspots",
      "ifMulti": "n",
      "multiServices": [],
      "singleService": "panoHotspots"
    },
    "fix-coordinates": {
      "fileName": "fix-coordinates",
      "camelName": "fixCoordinates",
      "ifMulti": "n",
      "multiServices": [],
      "singleService": "panos"
    },
    "verify-recaptcha": {
      "fileName": "verify-recaptcha",
      "camelName": "verifyRecaptcha",
      "ifMulti": "n",
      "multiServices": [],
      "singleService": "salesLeads"
    },
    "require-query": {
      "fileName": "require-query",
      "camelName": "requireQuery",
      "ifMulti": "y",
      "multiServices": [
        "mapPoints"
      ],
      "singleService": ""
    },
    "clear-xml-cache": {
      "fileName": "clear-xml-cache",
      "camelName": "clearXmlCache",
      "ifMulti": "y",
      "multiServices": [
        "envPanos",
        "environments",
        "panoHotspots"
      ],
      "singleService": ""
    }
  },
  "authentication": {
    "strategies": [
      "local",
      "google",
      "facebook"
    ],
    "entity": "users"
  },
  "connections": {
    "mongoose": {
      "database": "mongodb",
      "adapter": "mongoose",
      "connectionString": "mongodb://localhost:27017/rovit_api"
    }
  }
};

const fakeFeathersSchemas = {
  businesses: {
    // !<DEFAULT> code: schema_header
    title: 'Businesses',
    description: 'Businesses database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'name'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {
        faker: 'company.companyName'
      },
      phones: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {
              faker: {
                exp: '["home", "work"][Math.floor(Math.random() * 2)]'
              }
            },
            number: {
              faker: 'phone.phoneNumber'
            }
          }
        }
      },
      emails: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: {
              faker: {
                exp: '["home", "work"][Math.floor(Math.random() * 2)]'
              }
            },
            email: {
              faker: 'internet.email'
            }
          }
        }
      },
      primaryContact: {
        faker: 'name.findName'
      },
      notes: {
        faker: 'lorem.paragraph'
      }
      // !end
    },
    // !code: schema_more // !end
  },
  categories: {
    // !<DEFAULT> code: schema_header
    title: 'Categories',
    description: 'Categories database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'name',
      'path'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {
        faker: 'lorem.word'
      },
      path: {
        faker: {
          exp: 'rec.name'
        }
      },
      sortOrder: {
        type: 'number',
        faker: 'random.number'
      },
      clientId: { type: 'ID' },
      environmentIds: {
        type: 'array',
        items: { type: 'ID' }
      },
      isGlobal: {
        type: 'boolean',
        default: false
      }
      // !end
    },
    // !code: schema_more // !end
  },
  clientUsers: {
    // !<DEFAULT> code: schema_header
    title: 'ClientUsers',
    description: 'ClientUsers database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'clientId',
      'userId'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      clientId: { type: 'ID' },
      userId: { type: 'ID' }
      // !end
    },
    // !code: schema_more // !end
  },
  clients: {
    // !<DEFAULT> code: schema_header
    title: 'Clients',
    description: 'Clients database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'name'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {
        faker: 'name.findName'
      },
      notes: {
        faker: 'lorem.paragraph'
      }
      // !end
    },
    // !code: schema_more // !end
  },
  config: {
    // !<DEFAULT> code: schema_header
    title: 'Config',
    description: 'Config database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'name',
      'value'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {},
      value: {}
      // !end
    },
    // !code: schema_more // !end
  },
  envPanos: {
    // !<DEFAULT> code: schema_header
    title: 'EnvPanos',
    description: 'EnvPanos database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'environmentId',
      'panoId'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      environmentId: {
        type: 'ID'
      },
      panoId: {
        type: 'ID'
      }
      // !end
    },
    // !code: schema_more // !end
  },
  environments: {
    // !<DEFAULT> code: schema_header
    title: 'Environments',
    description: 'Environments database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'name',
      'slug',
      'clientId'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {
        faker: 'address.country'
      },
      slug: {
        faker: {
          exp: 'rec.name.toLowerCase().replace(" ", "-")'
        }
      },
      clientId: {
        type: 'ID'
      },
      notes: {
        faker: 'lorem.paragraph'
      },
      startingPanoId: {
        type: 'ID'
      },
      headerColor: {
        faker: 'internet.color'
      },
      headerLogoUrl: {
        faker: 'random.image'
      },
      headerLogoData: {
        type: 'object',
        properties: {}
      }
      // !end
    },
    // !code: schema_more // !end
  },
  faqs: {
    // !<DEFAULT> code: schema_header
    title: 'Faqs',
    description: 'Faqs database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'question',
      'answer'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      question: {
        faker: 'lorem.sentence'
      },
      answer: {
        faker: 'lorem.sentence'
      },
      isPublic: {
        type: 'boolean',
        default: false
      }
      // !end
    },
    // !code: schema_more // !end
  },
  hotspotIcons: {
    // !<DEFAULT> code: schema_header
    title: 'HotspotIcons',
    description: 'HotspotIcons database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'fileUrl'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {
        faker: 'lorem.word'
      },
      fileUrl: {
        faker: 'random.image'
      },
      uploadInfo: {}
      // !end
    },
    // !code: schema_more // !end
  },
  infoboxMedia: {
    // !<DEFAULT> code: schema_header
    title: 'InfoboxMedia',
    description: 'InfoboxMedia database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'infoboxId',
      'name'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      infoboxId: {
        type: 'ID'
      },
      panoId: {
        type: 'ID'
      },
      name: {
        faker: 'address.state'
      },
      description: {
        faker: 'lorem.paragraph'
      },
      type: {
        type: 'string',
        enum:  [ 'photo', 'video', '360', 'content-image', 'content-markdown' ]
      },
      content: {
        faker: 'lorem.paragraph'
      },
      mediaUrl: {
        faker: 'random.image'
      },
      uploadInfo: {},
      location: {
        type: 'object',
        properties: {
          type: {
            default: 'point'
          },
          coordinates: {
            type: 'array'
          }
        }
      }
      // !end
    },
    // !code: schema_more // !end
  },
  infoboxTypes: {
    // !<DEFAULT> code: schema_header
    title: 'InfoboxTypes',
    description: 'InfoboxTypes database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'name',
      'slug'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {
        type: 'string',
        faker: 'lorem.word'
      },
      slug: {
        type: 'string',
        faker: {
          exp: 'rec.name.toLowerCase().replace(" ", "-")'
        }
      }
      // !end
    },
    // !code: schema_more // !end
  },
  infoboxVideos: {
    // !<DEFAULT> code: schema_header
    title: 'InfoboxVideos',
    description: 'InfoboxVideos database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'infoboxId',
      'url',
      'videoId',
      'service'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      infoboxId: {
        type: 'ID'
      },
      url: {
        faker: 'image.imageUrl'
      },
      videoId: {
        type: 'ID'
      },
      service: {
        // faker: {
        //   exp: 'random.arrayElement("youtube", "vimeo")'
        // }
      },

      // YouTube Attributes
      contentDetails: {},
      snippet: {}
      // !end
    },
    // !code: schema_more // !end
  },
  infoboxes: {
    // !<DEFAULT> code: schema_header
    title: 'Infoboxes',
    description: 'Infoboxes database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'name'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {
        faker: 'lorem.word'
      },
      description: {
        faker: 'lorem.paragraph'
      },
      type: {
        type: 'string',
        enum: ['basic', 'extended', 'pano-gallery']
      },
      primaryPhotoUrl: {
        faker: 'image.imageUrl'
      },
      primaryPhotoCoordinates: {},
      primaryPhotoUploadInfo: {},
      categories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: {
              type: 'ID'
            },
            name: {},
            path: {}
          }
        }
      },
      location: {
        type: 'object',
        properties: {
          type: {
            default: 'Point'
          },
          coordinates: {
            type: 'array'
          }
        }
      },
      phone: {
        faker: 'phone.phoneNumber'
      },
      tourLink: {
        faker: 'internet.url'
      },
      learnMoreLink: {
        faker: 'internet.url'
      },
      meta: {}

      // !end
    },
    // !code: schema_more // !end
  },
  mapPoints: {
    // !<DEFAULT> code: schema_header
    title: 'MapPoints',
    description: 'MapPoints database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties // !end
    },
    // !code: schema_more // !end
  },
  panoHotspots: {
    // !<DEFAULT> code: schema_header
    title: 'PanoHotspots',
    description: 'PanoHotspots database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'type',
      'envPanoId',
      'panoId',
      'percentX',
      'percentY'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      type: {
        type: 'string',
        enum: [ 'pano', 'link', 'infobox' ]
      },
      envPanoId: {
        type: 'ID'
      },
      panoId: {
        type: 'ID'
      },
      targetPanoId: {
        type: 'ID'
      },
      infoboxId: {
        type: 'ID'
      },
      hotspotIconId: {
        type: 'ID'
      },
      hotspotIconSize: {
        type: 'number',
        faker: {
          exp: 'ctx.faker.random.number({min: 1, max: 10})'
        }
      },
      linkMeta: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            faker: 'image.imageUrl'
          },
          target: {
            type: 'string',
            enum: [ '', 'current', 'blank' ],
            default: ''
          }
        },
      },
      percentX: {
        type: 'number',
        faker: {
          exp: 'ctx.faker.random.number({min: 0, max: 100})'
        }
      },
      percentY: {
        type: 'number',
        faker: {
          exp: 'ctx.faker.random.number({min: 0, max: 100})'
        }
      },
      coordinates: {
        type: 'array',
        items: {
          type: 'number'
        }
      }
      // !end
    },
    // !code: schema_more // !end
  },
  panos: {
    // !<DEFAULT> code: schema_header
    title: 'Panos',
    description: 'Panos database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'name',
      'slug',
      'imageUrl'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {
        type: 'string',
        faker: 'address.city'
      },
      slug: {
        type: 'string',
        faker: {
          exp: `rec.name.toLowerCase().replace(' ', '-')`
        }
      },
      imageUrl: {
        type: 'string',
        faker: 'image.imageUrl'
      },
      uploadInfo: {
        type: 'object',
        properties: {}
      },
      location: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            default: 'Point'
          },
          coordinates: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            additionalItems: false,
            items: [
              {
                type: 'number',
                minimum: -180,
                maximum: 180
              },
              {
                type: 'number',
                minimum: -90,
                maximum: 90
              }
            ]
          }
        }
      },
      tags: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      tagIds: {
        type: 'array',
        items: {
          type: 'ID'
        }
      }
      // !end
    },
    // !code: schema_more // !end
  },
  salesLeads: {
    // !<DEFAULT> code: schema_header
    title: 'SalesLeads',
    description: 'SalesLeads database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'name',
      'email'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      name: {
        type: 'string',
        faker: 'name.findName'
      },
      email: {
        type: 'string',
        faker: 'internet.email'
      },
      phone: {
        type: 'string',
        faker: 'phone.phoneNumber'
      },
      companyName: {
        type: 'string',
        faker: 'company.companyName'
      },
      businessId: {
        type: 'ID'
      },
      isSubscribedToNewsletter: {
        type: 'boolean',
        default: false
      },
      remoteIp: {
        type: 'string',
        faker: 'internet.ip'
      },
      callbackDateTime: {
        type: 'string',
        format: 'date-time'
      }
      // !end
    },
    // !code: schema_more // !end
  },
  salesNotes: {
    // !<DEFAULT> code: schema_header
    title: 'SalesNotes',
    description: 'SalesNotes database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'salesLeadId',
      'text',
      'createdBy'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      salesLeadId: {
        type: 'ID'
      },
      text: {
        type: 'string',
        faker: 'lorem.paragraph'
      },
      createdById: {
        type: 'ID'
      }
      // !end
    },
    // !code: schema_more // !end
  },
  statViews: {
    // !<DEFAULT> code: schema_header
    title: 'StatViews',
    description: 'StatViews database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      type: {
        type: 'string',
        enum: [ 'environment', 'pano', 'infobox' ]
      },
      userId: {
        type: 'ID'
      },
      envId: {
        type: 'ID'
      },
      panoId: {
        type: 'ID'
      },
      infoboxId: {
        type: 'ID'
      },

      // !end
    },
    // !code: schema_more // !end
  },
  tags: {
    // !<DEFAULT> code: schema_header
    title: 'Tags',
    description: 'Tags database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'text',
      'slug'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      text: {
        type: 'string'
      },
      slug: {
        type: 'string'
      }
      // !end
    },
    // !code: schema_more // !end
  },
  tourMenuItems: {
    // !<DEFAULT> code: schema_header
    title: 'TourMenuItems',
    description: 'TourMenuItems database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'text'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      text: {
        type: 'string',
        faker: 'lorem.'
      },
      envId: {
        type: 'ID'
      },
      type: {
        type: 'string',
        enum: [ 'Infobox', 'Pano']
      },
      panoId: {
        type: 'ID'
      },
      infoboxId: {
        type: 'ID'
      },
      sortOrder: {
        type: 'number'
      }
      // !end
    },
    // !code: schema_more // !end
  },
  users: {
    // !<DEFAULT> code: schema_header
    title: 'Users',
    description: 'Users database.',
    // !end
    // !code: schema_definitions
    fakeRecords: 6,
    // !end

    // Required fields.
    required: [
      // !code: schema_required
      'email',
      'password',
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique
      'email'
      // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      _id: { type: 'ID' },
      email: { faker: 'internet.email' },
      password: { chance: { hash: { length: 60 } } }
      // !end
    },
    // !code: schema_more // !end
  },
  vr: {
    // !<DEFAULT> code: schema_header
    title: 'Vr',
    description: 'Vr database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties // !end
    },
    // !code: schema_more // !end
  },
  xmlCache: {
    // !<DEFAULT> code: schema_header
    title: 'XmlCache',
    description: 'XmlCache database.',
    // !end
    // !code: schema_definitions // !end

    // Required fields.
    required: [
      // !code: schema_required
      'envId',
      'envSlug',
      'data'
      // !end
    ],
    // Fields with unique values.
    uniqueItemProperties: [
      // !code: schema_unique // !end
    ],

    // Fields in the model.
    properties: {
      // !code: schema_properties
      envId: {
        type: 'ID'
      },
      envSlug: {
        type: 'string'
      },
      data: {
        type: 'string'
      }
      // !end
    },
    // !code: schema_more // !end
  },
};

const expectedIypescriptTypes = {};
const expectedTypescriptExtends = {};
const expectedMongoJsonSchema = {};
const expectedMongooseSchema = {};
const expectedSeqModel = {};
const expectedSeqFks = {};

const { mapping, feathersSpecs } = serviceSpecsExpand(specs, null, fakeFeathersSchemas);
// inspector('...mapping', mapping);
// inspector('...feathersSpecs', feathersSpecs);

Object.keys(specs.services).forEach(name => {
  console.log('...extract-module. Extract for serviceName=', name);
  const specsService = specs.services[name];

  const { typescriptTypes, typescriptExtends } =
    serviceSpecsToTypescript(specsService, feathersSpecs[name], feathersSpecs[name]._extensions);
  // inspector(`\n\n.....${name} typescriptTypes`, typescriptTypes);
  // inspector(`.....${name} typescriptExtends`, typescriptExtends);

  expectedIypescriptTypes[name] = typescriptTypes;
  expectedTypescriptExtends[name] = typescriptExtends;

  const mongoJsonSchema = serviceSpecsToMongoJsonSchema(feathersSpecs[name], feathersSpecs[name]._extensions);
  // inspector(`.....${name} mongoJsonSchema`, mongoJsonSchema);

  expectedMongoJsonSchema[name] = mongoJsonSchema;

  const mongooseSchema = serviceSpecsToMongoose(feathersSpecs[name], feathersSpecs[name]._extensions);
  // inspector(`.....${name} mongooseSchema`, mongooseSchema);

  expectedMongooseSchema[name] = mongooseSchema;

  const { seqModel, seqFks } = serviceSpecsToSequelize(feathersSpecs[name], feathersSpecs[name]._extensions);
  // inspector(`.....${name} seqModel`, seqModel);
  // inspector(`.....${name} seqFks`, seqFks);

  expectedSeqModel[name] = seqModel;
  expectedSeqFks[name] = seqFks;
});

// Process objects created by Sequelize.ENUM([option1, option2, ...])
traverse(expectedSeqModel).forEach(function (value) {
  if (typeof value === 'object' && value instanceof Sequelize.ENUM) {
    // Replace Sequelize.ENUM object with a unique func that stringify-plus will replace
    const uniqueFunc = new Function(`return ${Math.random()};`);
    this.update(uniqueFunc);

    // Identify what stringify-plus should replace that unique function by
    const str = `Sequelize.ENUM(${JSON.stringify(value.values)})`;
    Object.assign(sequelizeNativeFuncs, { [uniqueFunc]: str });
  }
});

const typescriptTypesStr = stringifyPlus(expectedIypescriptTypes);
const typescriptExtendsStr = stringifyPlus(expectedTypescriptExtends);
const mongoJsonSchemaStr = stringifyPlus(expectedMongoJsonSchema);
const mongooseSchemaStr = stringifyPlus(expectedMongooseSchema, { nativeFuncs: mongooseNativeFuncs });
const seqModelStr = stringifyPlus(expectedSeqModel, { nativeFuncs: sequelizeNativeFuncs });
const seqFksStr = stringifyPlus(expectedSeqFks);
console.log(`\nconst expectedSeqModel = ${seqModelStr};`);
/*
console.log('===========================================================');
console.log(`\nconst expectedTypescriptTypes = ${typescriptTypesStr};`);
console.log(`\nconst expectedTypescriptExtends = ${typescriptExtendsStr};`);
console.log(`\nconst expectedMongoJsonSchema = ${mongoJsonSchemaStr};`);
console.log(`\nconst expectedMongooseSchema = ${mongooseSchemaStr};`);
console.log(`\nconst expectedSeqModel = ${seqModelStr};`);
console.log(`\nconst expectedSeqFks = ${seqFksStr};`);
console.log('===========================================================');
*/