
const mongoose = require('mongoose');
const Sequelize = require('sequelize');
const jsonSchemaRunner = require('../helpers/json-schema-runner');
const mongooseTypeEquivalence = { // json-schema: mongoose
  'array': Array,
  'buffer': Buffer,
  'boolean': Boolean,
  'date': Date,
  'mixed': mongoose.Schema.Types.Mixed,
  'number': Number,
  'objectid': mongoose.Schema.Types.ObjectId,
  'string': String,
  'object': Object,
  'integer': Number,
  'ID': mongoose.Schema.Types.ObjectId // Our GraphQL custom scalar
};

const sequelizeTypeEquivalences = {
  'boolean': Sequelize.BOOLEAN,
  'enum': Sequelize.ENUM,
  'integer': Sequelize.INTEGER,
  'jsonb': Sequelize.JSONB,
  'real': Sequelize.REAL,
  'string': Sequelize.STRING,
  'text': Sequelize.TEXT,
  'date': Sequelize.DATE,
  'dateonly': Sequelize.DATEONLY,
};

// Source for tests
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

// Expected results
const expectedTypescriptTypes = {
  users: [
    "_id: unknown",
    "email: string",
    "password: string"
  ],
  clientUsers: [
    "clientId: unknown",
    "userId: unknown"
  ],
  businesses: [
    "name: string",
    "phones: any[]",
    "emails: any[]",
    "primaryContact: string",
    "notes: string"
  ],
  categories: [
    "name: string",
    "path: string",
    "sortOrder: number",
    "clientId: unknown",
    "environmentIds: string[]",
    "isGlobal: boolean"
  ],
  clients: [
    "name: string",
    "notes: string"
  ],
  config: [
    "name: string",
    "value: string"
  ],
  envPanos: [
    "environmentId: unknown",
    "panoId: unknown"
  ],
  environments: [
    "name: string",
    "slug: string",
    "clientId: unknown",
    "notes: string",
    "startingPanoId: unknown",
    "headerColor: string",
    "headerLogoUrl: string",
    "headerLogoData: {\n\n}"
  ],
  faqs: [
    "question: string",
    "answer: string",
    "isPublic: boolean"
  ],
  hotspotIcons: [
    "name: string",
    "fileUrl: string",
    "uploadInfo: string"
  ],
  infoboxMedia: [
    "infoboxId: unknown",
    "panoId: unknown",
    "name: string",
    "description: string",
    "type: string",
    "content: string",
    "mediaUrl: string",
    "uploadInfo: string",
    "location: {\n  type: string;\n  coordinates: string[]\n}"
  ],
  infoboxTypes: [
    "name: string",
    "slug: string"
  ],
  infoboxVideos: [
    "infoboxId: unknown",
    "url: string",
    "videoId: unknown",
    "service: string",
    "contentDetails: string",
    "snippet: string"
  ],
  infoboxes: [
    "name: string",
    "description: string",
    "type: string",
    "primaryPhotoUrl: string",
    "primaryPhotoCoordinates: string",
    "primaryPhotoUploadInfo: string",
    "categories: any[]",
    "location: {\n  type: string;\n  coordinates: string[]\n}",
    "phone: string",
    "tourLink: string",
    "learnMoreLink: string",
    "meta: string"
  ],
  panoHotspots: [
    "type: string",
    "envPanoId: unknown",
    "panoId: unknown",
    "targetPanoId: unknown",
    "infoboxId: unknown",
    "hotspotIconId: unknown",
    "hotspotIconSize: number",
    "linkMeta: {\n  url: string;\n  target: string\n}",
    "percentX: number",
    "percentY: number",
    "coordinates: number[]"
  ],
  panos: [
    "name: string",
    "slug: string",
    "imageUrl: string",
    "uploadInfo: {\n\n}",
    "location: {\n  type: string;\n  coordinates: any[]\n}",
    "tags: string[]",
    "tagIds: string[]"
  ],
  salesLeads: [
    "name: string",
    "email: string",
    "phone: string",
    "companyName: string",
    "businessId: unknown",
    "isSubscribedToNewsletter: boolean",
    "remoteIp: string",
    "callbackDateTime: string"
  ],
  salesNotes: [
    "salesLeadId: unknown",
    "text: string",
    "createdById: unknown"
  ],
  statViews: [
    "type: string",
    "userId: unknown",
    "envId: unknown",
    "panoId: unknown",
    "infoboxId: unknown"
  ],
  tags: [
    "text: string",
    "slug: string"
  ],
  tourMenuItems: [
    "text: string",
    "envId: unknown",
    "type: string",
    "panoId: unknown",
    "infoboxId: unknown",
    "sortOrder: number"
  ],
  vr: [],
  mapPoints: [],
  xmlCache: [
    "envId: unknown",
    "envSlug: string",
    "data: string"
  ]
};
const expectedTypescriptExtends = {
  users: [
    "_id: any"
  ],
  clientUsers: [
    "clientId: any",
    "userId: any"
  ],
  businesses: [],
  categories: [
    "clientId: any"
  ],
  clients: [],
  config: [],
  envPanos: [
    "environmentId: any",
    "panoId: any"
  ],
  environments: [
    "clientId: any",
    "startingPanoId: any"
  ],
  faqs: [],
  hotspotIcons: [],
  infoboxMedia: [
    "infoboxId: any",
    "panoId: any"
  ],
  infoboxTypes: [],
  infoboxVideos: [
    "infoboxId: any",
    "videoId: any"
  ],
  infoboxes: [],
  panoHotspots: [
    "envPanoId: any",
    "panoId: any",
    "targetPanoId: any",
    "infoboxId: any",
    "hotspotIconId: any"
  ],
  panos: [],
  salesLeads: [
    "businessId: any"
  ],
  salesNotes: [
    "salesLeadId: any",
    "createdById: any"
  ],
  statViews: [
    "userId: any",
    "envId: any",
    "panoId: any",
    "infoboxId: any"
  ],
  tags: [],
  tourMenuItems: [
    "envId: any",
    "panoId: any",
    "infoboxId: any"
  ],
  vr: [],
  mapPoints: [],
  xmlCache: [
    "envId: any"
  ]
};
const expectedMongoJsonSchema = {
  users: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      email: {
        faker: "internet.email",
        bsonType: "string"
      },
      password: {
        chance: {
          hash: {
            length: 60
          }
        },
        bsonType: "string"
      }
    },
    required: [
      "email",
      "password"
    ]
  },
  clientUsers: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      clientId: {
        bsonType: "objectId"
      },
      userId: {
        bsonType: "objectId"
      }
    },
    required: [
      "clientId",
      "userId"
    ]
  },
  businesses: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "company.companyName",
        bsonType: "string"
      },
      phones: {
        items: {
          type: "object",
          properties: {
            type: {
              faker: {
                exp: "[\"home\", \"work\"][Math.floor(Math.random() * 2)]"
              }
            },
            number: {
              faker: "phone.phoneNumber"
            }
          }
        },
        bsonType: "array"
      },
      emails: {
        items: {
          type: "object",
          properties: {
            type: {
              faker: {
                exp: "[\"home\", \"work\"][Math.floor(Math.random() * 2)]"
              }
            },
            email: {
              faker: "internet.email"
            }
          }
        },
        bsonType: "array"
      },
      primaryContact: {
        faker: "name.findName",
        bsonType: "string"
      },
      notes: {
        faker: "lorem.paragraph",
        bsonType: "string"
      }
    },
    required: [
      "name"
    ]
  },
  categories: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "lorem.word",
        bsonType: "string"
      },
      path: {
        faker: {
          exp: "rec.name"
        },
        bsonType: "string"
      },
      sortOrder: {
        faker: "random.number",
        bsonType: "number"
      },
      clientId: {
        bsonType: "objectId"
      },
      environmentIds: {
        items: {
          type: "ID"
        },
        bsonType: "array"
      },
      isGlobal: {
        default: false,
        bsonType: "boolean"
      }
    },
    required: [
      "name",
      "path"
    ]
  },
  clients: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "name.findName",
        bsonType: "string"
      },
      notes: {
        faker: "lorem.paragraph",
        bsonType: "string"
      }
    },
    required: [
      "name"
    ]
  },
  config: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        bsonType: "string"
      },
      value: {
        bsonType: "string"
      }
    },
    required: [
      "name",
      "value"
    ]
  },
  envPanos: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      environmentId: {
        bsonType: "objectId"
      },
      panoId: {
        bsonType: "objectId"
      }
    },
    required: [
      "environmentId",
      "panoId"
    ]
  },
  environments: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "address.country",
        bsonType: "string"
      },
      slug: {
        faker: {
          exp: "rec.name.toLowerCase().replace(\" \", \"-\")"
        },
        bsonType: "string"
      },
      clientId: {
        bsonType: "objectId"
      },
      notes: {
        faker: "lorem.paragraph",
        bsonType: "string"
      },
      startingPanoId: {
        bsonType: "objectId"
      },
      headerColor: {
        faker: "internet.color",
        bsonType: "string"
      },
      headerLogoUrl: {
        faker: "random.image",
        bsonType: "string"
      },
      headerLogoData: {
        bsonType: "object",
        additionalProperties: false,
        properties: {
          _id: {
            bsonType: "objectId"
          }
        }
      }
    },
    required: [
      "name",
      "slug",
      "clientId"
    ]
  },
  faqs: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      question: {
        faker: "lorem.sentence",
        bsonType: "string"
      },
      answer: {
        faker: "lorem.sentence",
        bsonType: "string"
      },
      isPublic: {
        default: false,
        bsonType: "boolean"
      }
    },
    required: [
      "question",
      "answer"
    ]
  },
  hotspotIcons: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "lorem.word",
        bsonType: "string"
      },
      fileUrl: {
        faker: "random.image",
        bsonType: "string"
      },
      uploadInfo: {
        bsonType: "string"
      }
    },
    required: [
      "fileUrl"
    ]
  },
  infoboxMedia: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      infoboxId: {
        bsonType: "objectId"
      },
      panoId: {
        bsonType: "objectId"
      },
      name: {
        faker: "address.state",
        bsonType: "string"
      },
      description: {
        faker: "lorem.paragraph",
        bsonType: "string"
      },
      type: {
        enum: [
          "photo",
          "video",
          "360",
          "content-image",
          "content-markdown"
        ],
        bsonType: "string"
      },
      content: {
        faker: "lorem.paragraph",
        bsonType: "string"
      },
      mediaUrl: {
        faker: "random.image",
        bsonType: "string"
      },
      uploadInfo: {
        bsonType: "string"
      },
      location: {
        bsonType: "object",
        additionalProperties: false,
        properties: {
          _id: {
            bsonType: "objectId"
          },
          type: {
            default: "point",
            bsonType: "string"
          },
          coordinates: {
            items: {
              type: "string"
            },
            bsonType: "array"
          }
        }
      }
    },
    required: [
      "infoboxId",
      "name"
    ]
  },
  infoboxTypes: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "lorem.word",
        bsonType: "string"
      },
      slug: {
        faker: {
          exp: "rec.name.toLowerCase().replace(\" \", \"-\")"
        },
        bsonType: "string"
      }
    },
    required: [
      "name",
      "slug"
    ]
  },
  infoboxVideos: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      infoboxId: {
        bsonType: "objectId"
      },
      url: {
        faker: "image.imageUrl",
        bsonType: "string"
      },
      videoId: {
        bsonType: "objectId"
      },
      service: {
        bsonType: "string"
      },
      contentDetails: {
        bsonType: "string"
      },
      snippet: {
        bsonType: "string"
      }
    },
    required: [
      "infoboxId",
      "url",
      "videoId",
      "service"
    ]
  },
  infoboxes: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "lorem.word",
        bsonType: "string"
      },
      description: {
        faker: "lorem.paragraph",
        bsonType: "string"
      },
      type: {
        enum: [
          "basic",
          "extended",
          "pano-gallery"
        ],
        bsonType: "string"
      },
      primaryPhotoUrl: {
        faker: "image.imageUrl",
        bsonType: "string"
      },
      primaryPhotoCoordinates: {
        bsonType: "string"
      },
      primaryPhotoUploadInfo: {
        bsonType: "string"
      },
      categories: {
        items: {
          type: "object",
          properties: {
            _id: {
              type: "ID"
            },
            name: {},
            path: {}
          }
        },
        bsonType: "array"
      },
      location: {
        bsonType: "object",
        additionalProperties: false,
        properties: {
          _id: {
            bsonType: "objectId"
          },
          type: {
            default: "Point",
            bsonType: "string"
          },
          coordinates: {
            items: {
              type: "string"
            },
            bsonType: "array"
          }
        }
      },
      phone: {
        faker: "phone.phoneNumber",
        bsonType: "string"
      },
      tourLink: {
        faker: "internet.url",
        bsonType: "string"
      },
      learnMoreLink: {
        faker: "internet.url",
        bsonType: "string"
      },
      meta: {
        bsonType: "string"
      }
    },
    required: [
      "name"
    ]
  },
  panoHotspots: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      type: {
        enum: [
          "pano",
          "link",
          "infobox"
        ],
        bsonType: "string"
      },
      envPanoId: {
        bsonType: "objectId"
      },
      panoId: {
        bsonType: "objectId"
      },
      targetPanoId: {
        bsonType: "objectId"
      },
      infoboxId: {
        bsonType: "objectId"
      },
      hotspotIconId: {
        bsonType: "objectId"
      },
      hotspotIconSize: {
        faker: {
          exp: "ctx.faker.random.number({min: 1, max: 10})"
        },
        bsonType: "number"
      },
      linkMeta: {
        bsonType: "object",
        additionalProperties: false,
        properties: {
          _id: {
            bsonType: "objectId"
          },
          url: {
            faker: "image.imageUrl",
            bsonType: "string"
          },
          target: {
            enum: [
              "",
              "current",
              "blank"
            ],
            default: "",
            bsonType: "string"
          }
        }
      },
      percentX: {
        faker: {
          exp: "ctx.faker.random.number({min: 0, max: 100})"
        },
        bsonType: "number"
      },
      percentY: {
        faker: {
          exp: "ctx.faker.random.number({min: 0, max: 100})"
        },
        bsonType: "number"
      },
      coordinates: {
        items: {
          type: "number"
        },
        bsonType: "array"
      }
    },
    required: [
      "type",
      "envPanoId",
      "panoId",
      "percentX",
      "percentY"
    ]
  },
  panos: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "address.city",
        bsonType: "string"
      },
      slug: {
        faker: {
          exp: "rec.name.toLowerCase().replace(' ', '-')"
        },
        bsonType: "string"
      },
      imageUrl: {
        faker: "image.imageUrl",
        bsonType: "string"
      },
      uploadInfo: {
        bsonType: "object",
        additionalProperties: false,
        properties: {
          _id: {
            bsonType: "objectId"
          }
        }
      },
      location: {
        bsonType: "object",
        additionalProperties: false,
        properties: {
          _id: {
            bsonType: "objectId"
          },
          type: {
            default: "Point",
            bsonType: "string"
          },
          coordinates: {
            minItems: 2,
            maxItems: 2,
            additionalItems: false,
            items: [
              {
                type: "number",
                minimum: -180,
                maximum: 180
              },
              {
                type: "number",
                minimum: -90,
                maximum: 90
              }
            ],
            bsonType: "array"
          }
        }
      },
      tags: {
        items: {
          type: "string"
        },
        bsonType: "array"
      },
      tagIds: {
        items: {
          type: "ID"
        },
        bsonType: "array"
      }
    },
    required: [
      "name",
      "slug",
      "imageUrl"
    ]
  },
  salesLeads: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      name: {
        faker: "name.findName",
        bsonType: "string"
      },
      email: {
        faker: "internet.email",
        bsonType: "string"
      },
      phone: {
        faker: "phone.phoneNumber",
        bsonType: "string"
      },
      companyName: {
        faker: "company.companyName",
        bsonType: "string"
      },
      businessId: {
        bsonType: "objectId"
      },
      isSubscribedToNewsletter: {
        default: false,
        bsonType: "boolean"
      },
      remoteIp: {
        faker: "internet.ip",
        bsonType: "string"
      },
      callbackDateTime: {
        format: "date-time",
        bsonType: "string"
      }
    },
    required: [
      "name",
      "email"
    ]
  },
  salesNotes: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      salesLeadId: {
        bsonType: "objectId"
      },
      text: {
        faker: "lorem.paragraph",
        bsonType: "string"
      },
      createdById: {
        bsonType: "objectId"
      }
    },
    required: [
      "salesLeadId",
      "text",
      "createdBy"
    ]
  },
  statViews: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      type: {
        enum: [
          "environment",
          "pano",
          "infobox"
        ],
        bsonType: "string"
      },
      userId: {
        bsonType: "objectId"
      },
      envId: {
        bsonType: "objectId"
      },
      panoId: {
        bsonType: "objectId"
      },
      infoboxId: {
        bsonType: "objectId"
      }
    }
  },
  tags: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      text: {
        bsonType: "string"
      },
      slug: {
        bsonType: "string"
      }
    },
    required: [
      "text",
      "slug"
    ]
  },
  tourMenuItems: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      text: {
        faker: "lorem.",
        bsonType: "string"
      },
      envId: {
        bsonType: "objectId"
      },
      type: {
        enum: [
          "Infobox",
          "Pano"
        ],
        bsonType: "string"
      },
      panoId: {
        bsonType: "objectId"
      },
      infoboxId: {
        bsonType: "objectId"
      },
      sortOrder: {
        bsonType: "number"
      }
    },
    required: [
      "text"
    ]
  },
  vr: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      }
    }
  },
  mapPoints: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      }
    }
  },
  xmlCache: {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      envId: {
        bsonType: "objectId"
      },
      envSlug: {
        bsonType: "string"
      },
      data: {
        bsonType: "string"
      }
    },
    required: [
      "envId",
      "envSlug",
      "data"
    ]
  }
};
const expectedMongooseSchema = {
  users: {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  clientUsers: {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  businesses: {
    name: {
      type: String,
      required: true
    },
    phones: [],
    emails: [],
    primaryContact: String,
    notes: String
  },
  categories: {
    name: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    sortOrder: Number,
    clientId: mongoose.Schema.Types.ObjectId,
    environmentIds: [
      mongoose.Schema.Types.ObjectId
    ],
    isGlobal: Boolean
  },
  clients: {
    name: {
      type: String,
      required: true
    },
    notes: String
  },
  config: {
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  envPanos: {
    environmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    panoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  environments: {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    notes: String,
    startingPanoId: mongoose.Schema.Types.ObjectId,
    headerColor: String,
    headerLogoUrl: String,
    headerLogoData: {}
  },
  faqs: {
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    isPublic: Boolean
  },
  hotspotIcons: {
    name: String,
    fileUrl: {
      type: String,
      required: true
    },
    uploadInfo: String
  },
  infoboxMedia: {
    infoboxId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    panoId: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum: [
        "photo",
        "video",
        "360",
        "content-image",
        "content-markdown"
      ]
    },
    content: String,
    mediaUrl: String,
    uploadInfo: String,
    location: {
      type: {
        type: String,
        default: "point"
      },
      coordinates: [
        String
      ]
    }
  },
  infoboxTypes: {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    }
  },
  infoboxVideos: {
    infoboxId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    service: {
      type: String,
      required: true
    },
    contentDetails: String,
    snippet: String
  },
  infoboxes: {
    name: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum: [
        "basic",
        "extended",
        "pano-gallery"
      ]
    },
    primaryPhotoUrl: String,
    primaryPhotoCoordinates: String,
    primaryPhotoUploadInfo: String,
    categories: [],
    location: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: [
        String
      ]
    },
    phone: String,
    tourLink: String,
    learnMoreLink: String,
    meta: String
  },
  panoHotspots: {
    type: {
      type: String,
      enum: [
        "pano",
        "link",
        "infobox"
      ],
      required: true
    },
    envPanoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    panoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    targetPanoId: mongoose.Schema.Types.ObjectId,
    infoboxId: mongoose.Schema.Types.ObjectId,
    hotspotIconId: mongoose.Schema.Types.ObjectId,
    hotspotIconSize: Number,
    linkMeta: {
      url: String,
      target: {
        type: String,
        enum: [
          "",
          "current",
          "blank"
        ]
      }
    },
    percentX: {
      type: Number,
      required: true
    },
    percentY: {
      type: Number,
      required: true
    },
    coordinates: [
      Number
    ]
  },
  panos: {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    uploadInfo: {},
    location: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: [
        Number
      ]
    },
    tags: [
      String
    ],
    tagIds: [
      mongoose.Schema.Types.ObjectId
    ]
  },
  salesLeads: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    companyName: String,
    businessId: mongoose.Schema.Types.ObjectId,
    isSubscribedToNewsletter: Boolean,
    remoteIp: String,
    callbackDateTime: String
  },
  salesNotes: {
    salesLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdById: mongoose.Schema.Types.ObjectId
  },
  statViews: {
    type: {
      type: String,
      enum: [
        "environment",
        "pano",
        "infobox"
      ]
    },
    userId: mongoose.Schema.Types.ObjectId,
    envId: mongoose.Schema.Types.ObjectId,
    panoId: mongoose.Schema.Types.ObjectId,
    infoboxId: mongoose.Schema.Types.ObjectId
  },
  tags: {
    text: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    }
  },
  tourMenuItems: {
    text: {
      type: String,
      required: true
    },
    envId: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: [
        "Infobox",
        "Pano"
      ]
    },
    panoId: mongoose.Schema.Types.ObjectId,
    infoboxId: mongoose.Schema.Types.ObjectId,
    sortOrder: Number
  },
  vr: {},
  mapPoints: {},
  xmlCache: {
    envId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    envSlug: {
      type: String,
      required: true
    },
    data: {
      type: String,
      required: true
    }
  }
};
const expectedSeqModel = {
  users: {
    email: {
      type: sequelizeTypeEquivalences.text,
      unique: true,
      allowNull: false
    },
    password: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    }
  },
  clientUsers: {
    clientId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    userId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    }
  },
  businesses: {
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    phones: {
      type: sequelizeTypeEquivalences.jsonb
    },
    emails: {
      type: sequelizeTypeEquivalences.jsonb
    },
    primaryContact: {
      type: sequelizeTypeEquivalences.text
    },
    notes: {
      type: sequelizeTypeEquivalences.text
    }
  },
  categories: {
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    path: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    sortOrder: {
      type: sequelizeTypeEquivalences.real
    },
    clientId: {
      type: sequelizeTypeEquivalences.integer
    },
    environmentIds: {
      type: sequelizeTypeEquivalences.jsonb
    },
    isGlobal: {
      type: sequelizeTypeEquivalences.boolean,
      default: false
    }
  },
  clients: {
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    notes: {
      type: sequelizeTypeEquivalences.text
    }
  },
  config: {
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    value: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    }
  },
  envPanos: {
    environmentId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    panoId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    }
  },
  environments: {
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    slug: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    clientId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    notes: {
      type: sequelizeTypeEquivalences.text
    },
    startingPanoId: {
      type: sequelizeTypeEquivalences.integer
    },
    headerColor: {
      type: sequelizeTypeEquivalences.text
    },
    headerLogoUrl: {
      type: sequelizeTypeEquivalences.text
    },
    headerLogoData: {
      type: sequelizeTypeEquivalences.jsonb
    }
  },
  faqs: {
    question: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    answer: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    isPublic: {
      type: sequelizeTypeEquivalences.boolean,
      default: false
    }
  },
  hotspotIcons: {
    name: {
      type: sequelizeTypeEquivalences.text
    },
    fileUrl: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    uploadInfo: {
      type: sequelizeTypeEquivalences.text
    }
  },
  infoboxMedia: {
    infoboxId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    panoId: {
      type: sequelizeTypeEquivalences.integer
    },
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    description: {
      type: sequelizeTypeEquivalences.text
    },
    type: {
      type: Sequelize.ENUM(["photo","video","360","content-image","content-markdown"])
    },
    content: {
      type: sequelizeTypeEquivalences.text
    },
    mediaUrl: {
      type: sequelizeTypeEquivalences.text
    },
    uploadInfo: {
      type: sequelizeTypeEquivalences.text
    },
    location: {
      type: sequelizeTypeEquivalences.jsonb
    }
  },
  infoboxTypes: {
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    slug: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    }
  },
  infoboxVideos: {
    infoboxId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    url: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    videoId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    service: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    contentDetails: {
      type: sequelizeTypeEquivalences.text
    },
    snippet: {
      type: sequelizeTypeEquivalences.text
    }
  },
  infoboxes: {
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    description: {
      type: sequelizeTypeEquivalences.text
    },
    type: {
      type: Sequelize.ENUM(["basic","extended","pano-gallery"])
    },
    primaryPhotoUrl: {
      type: sequelizeTypeEquivalences.text
    },
    primaryPhotoCoordinates: {
      type: sequelizeTypeEquivalences.text
    },
    primaryPhotoUploadInfo: {
      type: sequelizeTypeEquivalences.text
    },
    categories: {
      type: sequelizeTypeEquivalences.jsonb
    },
    location: {
      type: sequelizeTypeEquivalences.jsonb
    },
    phone: {
      type: sequelizeTypeEquivalences.text
    },
    tourLink: {
      type: sequelizeTypeEquivalences.text
    },
    learnMoreLink: {
      type: sequelizeTypeEquivalences.text
    },
    meta: {
      type: sequelizeTypeEquivalences.text
    }
  },
  panoHotspots: {
    type: {
      type: Sequelize.ENUM(["pano","link","infobox"]),
      allowNull: false
    },
    envPanoId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    panoId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    targetPanoId: {
      type: sequelizeTypeEquivalences.integer
    },
    infoboxId: {
      type: sequelizeTypeEquivalences.integer
    },
    hotspotIconId: {
      type: sequelizeTypeEquivalences.integer
    },
    hotspotIconSize: {
      type: sequelizeTypeEquivalences.real
    },
    linkMeta: {
      type: sequelizeTypeEquivalences.jsonb
    },
    percentX: {
      type: sequelizeTypeEquivalences.real,
      allowNull: false
    },
    percentY: {
      type: sequelizeTypeEquivalences.real,
      allowNull: false
    },
    coordinates: {
      type: sequelizeTypeEquivalences.jsonb
    }
  },
  panos: {
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    slug: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    imageUrl: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    uploadInfo: {
      type: sequelizeTypeEquivalences.jsonb
    },
    location: {
      type: sequelizeTypeEquivalences.jsonb
    },
    tags: {
      type: sequelizeTypeEquivalences.jsonb
    },
    tagIds: {
      type: sequelizeTypeEquivalences.jsonb
    }
  },
  salesLeads: {
    name: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    email: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    phone: {
      type: sequelizeTypeEquivalences.text
    },
    companyName: {
      type: sequelizeTypeEquivalences.text
    },
    businessId: {
      type: sequelizeTypeEquivalences.integer
    },
    isSubscribedToNewsletter: {
      type: sequelizeTypeEquivalences.boolean,
      default: false
    },
    remoteIp: {
      type: sequelizeTypeEquivalences.text
    },
    callbackDateTime: {
      type: sequelizeTypeEquivalences.date
    }
  },
  salesNotes: {
    salesLeadId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    text: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    createdById: {
      type: sequelizeTypeEquivalences.integer
    }
  },
  statViews: {
    type: {
      type: Sequelize.ENUM(["environment","pano","infobox"])
    },
    userId: {
      type: sequelizeTypeEquivalences.integer
    },
    envId: {
      type: sequelizeTypeEquivalences.integer
    },
    panoId: {
      type: sequelizeTypeEquivalences.integer
    },
    infoboxId: {
      type: sequelizeTypeEquivalences.integer
    }
  },
  tags: {
    text: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    slug: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    }
  },
  tourMenuItems: {
    text: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    envId: {
      type: sequelizeTypeEquivalences.integer
    },
    type: {
      type: Sequelize.ENUM(["Infobox","Pano"])
    },
    panoId: {
      type: sequelizeTypeEquivalences.integer
    },
    infoboxId: {
      type: sequelizeTypeEquivalences.integer
    },
    sortOrder: {
      type: sequelizeTypeEquivalences.real
    }
  },
  vr: {},
  mapPoints: {},
  xmlCache: {
    envId: {
      type: sequelizeTypeEquivalences.integer,
      allowNull: false
    },
    envSlug: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    },
    data: {
      type: sequelizeTypeEquivalences.text,
      allowNull: false
    }
  }
};
const expectedSeqFks = {
  users: [],
  clientUsers: [
    "clientId",
    "userId"
  ],
  businesses: [],
  categories: [
    "clientId"
  ],
  clients: [],
  config: [],
  envPanos: [
    "environmentId",
    "panoId"
  ],
  environments: [
    "clientId",
    "startingPanoId"
  ],
  faqs: [],
  hotspotIcons: [],
  infoboxMedia: [
    "infoboxId",
    "panoId"
  ],
  infoboxTypes: [],
  infoboxVideos: [
    "infoboxId",
    "videoId"
  ],
  infoboxes: [],
  panoHotspots: [
    "envPanoId",
    "panoId",
    "targetPanoId",
    "infoboxId",
    "hotspotIconId"
  ],
  panos: [],
  salesLeads: [
    "businessId"
  ],
  salesNotes: [
    "salesLeadId",
    "createdById"
  ],
  statViews: [
    "userId",
    "envId",
    "panoId",
    "infoboxId"
  ],
  tags: [],
  tourMenuItems: [
    "envId",
    "panoId",
    "infoboxId"
  ],
  vr: [],
  mapPoints: [],
  xmlCache: [
    "envId"
  ]
};

describe('marshall-app.test.js', () => {
  it('correctly converts schema to targets', () => {
    jsonSchemaRunner({
      specs, fakeFeathersSchemas, expectedTypescriptTypes, expectedTypescriptExtends,
      expectedMongoJsonSchema, expectedMongooseSchema, expectedSeqModel, expectedSeqFks
    });
  });
});
