
// Define the combined GraphQL schema. (Can be re-generated.)
// !code: imports // !end
// !code: init // !end

let moduleExports = `
type Team {
  id: ID
  name: String!
  members: [String!]
  users(query: JSON, params: JSON, key: JSON): [User!]
}
 
type User {
  id: ID
  email: String!
  firstName: String!
  lastName: String!
  password: String
  teams(query: JSON, params: JSON, key: JSON): [Team!]
}
 

type Query {
  getTeam(key: JSON, query: JSON, params: JSON): Team
  findTeam(query: JSON, params: JSON): [Team]!
  getUser(key: JSON, query: JSON, params: JSON): User
  findUser(query: JSON, params: JSON): [User]!
}
`;

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
