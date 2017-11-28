
module.exports.decorators = {
  people: {
    graphql: {
      sort: { id: 1 },
      discard: [ 'mass', 'height' ],
    },
  },
};

module.exports.schemas = {
  people: {

    "description": "A person within the Star Wars universe",
    "type": "object",
    "required": [
      "name",
      "height",
      "mass",
      "hair_color",
      "skin_color",
      "eye_color",
      "birth_year",
      "gender",
      "homeworld",
      "films",
      "species",
      "vehicles",
      "starships",
      "url"
    ],
    "properties": {
      "address" : {
        type: "object",
        properties: {
          street: {},
          city: {},
        }
      },
      "url": {
        "description": "The url of this resource",
        "type": "string"
      },
      "homeworld": {
        "description": "The url of the planet resource that this person was born on.",
        "type": "string"
      },
      "vehicles": {
        "description": "An array of vehicle resources that this person has piloted",
        "type": "array"
      },
      "films": {
        "description": "An array of urls of film resources that this person has been in.",
        "type": "array"
      },
      "starships": {
        "description": "An array of starship resources that this person has piloted",
        "type": "array"
      },
      "height": {
        "description": "The height of this person in meters.",
        "type": "string"
      },
      "skin_color": {
        "description": "The skin color of this person.",
        "type": "string"
      },
      "birth_year": {
        "description": "The birth year of this person. BBY (Before the Battle of Yavin) or ABY (After the Battle of Yavin).",
        "type": "string"
      },
      "eye_color": {
        "description": "The eye color of this person.",
        "type": "string"
      },
      "hair_color": {
        "description": "The hair color of this person.",
        "type": "string"
      },
      "gender": {
        "description": "The gender of this person (if known).",
        "type": "string"
      },
      "name": {
        "description": "The name of this person.",
        "type": "string"
      },
      "species": {
        "description": "The url of the species resource that this person is.",
        "type": "array"
      },
      "mass": {
        "description": "The mass of this person in kilograms.",
        "type": "string"
      }
    },
    "title": "People",
    "$schema": "http://json-schema.org/draft-04/schema"
  },
};