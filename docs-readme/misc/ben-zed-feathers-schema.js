// https://github.com/BenZed/feathers-schema

const a = {
  writeup: String,
  published: { type: Boolean, default: false },
  author: {
    required: true,
    name: { type: String, required: true, trim: true },
    age: { type: Number, range: ['>', 16, 'Must be over 16 years old.'] }
  },
  comments: [String]
};

// age: null // unprovided fields will be stored as null

const b = {
  property1: { type: String },
  property2: String,
  property3: [String]
};

let { ANY } = require('feathers-schema/types');
ANY = null; // literally

const c = {
  property1: String,
  property2: Number,
  property3: Boolean,
  property4: Date,
  property5: Object,
  property6: ANY // ( defined as null)
};

const d = {

  //Objects types with no sub properties may have any structure, and will not
  //be validated further.
  metadata_v1: Object, // { whatever: ['you want'], is: ['fine']} √
  metadata_v2: {},     //

  //However, it can only be placed in an array if the property is defined as
  //an array
  metadata_v3: [Object], //[{cool: true}, {beans: true}] √
  metadata_v4: [{}],

  //Object types with at least one nested property will be limited in structure
  //to those properties:
  name: {
    first: String,
    last: String
  } // { first: 'Jim', last: 'Beam', isABottleOfWhiskey: true } <-- last key will
  //be filtered by type sanitizer
};

const e = {
  whatever_v1: ANY,
  whatever_v2: null, // ANY === null, literally

  whatever_v3: undefined, // throws error. Must be null

  whatever_array_v1: [],
  whatever_array_v2: [ANY]
};

const attributes = {
  trim: true    /// trim is a sanitizer attribute
};