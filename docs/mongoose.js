
const mongoose = require('mongoose');

// schemaTypes
const a = {
  String,
  Number,
  Date,
  Buffer, // Binary adat, e.g. PDF
  Boolean,
  Mixed: mongoose.Schema.Types.Mixed, // Anything goes
  ObjectId: mongoose.Schema.ObjectId, // commonly specifies a link to another document in your database
  Array,
};

const x = {
  string: [
    'to lowercase',
    'to uppercase',
    'trim data prior to saving',
    'regular expression that can limit data allowed',
    'enum that can define a list of strings',
  ],
  Number: ['min', 'max'],
  Date: ['min', 'max'],
};

var userSchema1 = mongoose.Schema({
  firstName: String,
  lastName: String
});

var userSchema2 = mongoose.Schema({
  name: {
    firstName: String,
    lastName: String
  },
  created: Date
});

// Example

var authorSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    firstName: String,
    lastName: String
  },
  biography: String,
  twitter: String,
  facebook: String,
  linkedin: String,
  profilePicture: Buffer,
  created: {
    type: Date,
    default: Date.now
  }
});

var bookSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  summary: String,
  isbn: String,
  thumbnail: Buffer,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  ratings: [
    {
      summary: String,
      detail: String,
      numberOfStars: Number,
      created: {
        type: Date,
        default: Date.now
      }
    }
  ],
  created: {
    type: Date,
    default: Date.now
  }
});

var Author = mongoose.model('Author', authorSchema);
var Book = mongoose.model('Book', bookSchema);

var jamieAuthor = new Author({
  _id: new mongoose.Types.ObjectId(),
  name: {
    firstName: 'Jamie',
    lastName: 'Munro'
  },
  biography: 'Jamie is the author of ASP.NET MVC 5 with Bootstrap and Knockout.js.',
  twitter: 'https://twitter.com/endyourif',
  facebook: 'https://www.facebook.com/End-Your-If-194251957252562/'
});

jamieAuthor.save(function(err) {});

// *****

var authorSchema1 = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    firstName: {
      type: String,
      required: true
    },
    lastName: String
  },
  biography: String,
  twitter: {
    type: String,
    validate: {
      validator: function(text) {
        return text.indexOf('https://twitter.com/') === 0;
      },
      message: 'Twitter handle must start with https://twitter.com/'
    }
  },
  facebook: {
    type: String,
    validate: {
      validator: function(text) {
        return text.indexOf('https://www.facebook.com/') === 0;
      },
      message: 'Facebook must start with https://www.facebook.com/'
    }
  },
  linkedin: {
    type: String,
    validate: {
      validator: function(text) {
        return text.indexOf('https://www.linkedin.com/') === 0;
      },
      message: 'LinkedIn must start with https://www.linkedin.com/'
    }
  },
  profilePicture: Buffer,
  created: {
    type: Date,
    default: Date.now
  }
});

