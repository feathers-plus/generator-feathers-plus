
## GraphQL Pagination Proposal

> Proposal to support pagination for interior joins

#### Resolver paths

Let's use this as an example:
```js
'{
   findUser(query: {uuid: {__lt: 100000}}) {
     fullName
     posts(query: {draft: 0}) {
       body
       comments {
         body
       }
     }
   }
}'
```

At present a paginated result is returned if the top-level data-set was paginated.
The paginated info is only for that data-set, in this case the `user` records from the `findUser` call.
No information is provided regarding any pagination of the `post` records resulting from the `posts` call.

The following is a proposal to provide the missing pagination information.

We can analyze the AST of the Query string to produce a "resolver path" to identify when and why a resolver
is being called.
In the above example, the findUser resolver would produce a resolver path of
```json
[ 'findUser', '[User]!' ]
```

This 2-tuple means the resolver was called for the `findUser` GraphQL type,
and its expected to return a `[User]!` result.

Let's say findUser returned with 4 records.
We have to populate the posts for each, and each of the 4 populates would call the `posts` resolver.
This would result in the paths
```json
[ 'findUser', 0, 'User', 'posts', '[Post!]' ]
[ 'findUser', 1, 'User', 'posts', '[Post!]' ]
[ 'findUser', 2, 'User', 'posts', '[Post!]' ]
[ 'findUser', 3, 'User', 'posts', '[Post!]' ]
```

The 3-tuple `'findUser', n, 'User'` means the n-th record of the findUser result
(all of which are User GraphQL types)
followed by 2-tuple `'posts', '[Post!]'` which means that n-th record was populated by the post resolver,
resulting in a `[Post!]` result.

Now each of those posts has to be populated by their comments.
Let's say the first user had 2 posts, its resulting resolver paths would be
```json
[ 'findUser', 0, 'User', 'posts', 0, '[Post!]', 'comments', '[Comment!]' ]
[ 'findUser', 0, 'User', 'posts', 1, '[Post!]', 'comments', '[Comment!]' ]
```
and the other user records would have their own resultant paths.

In sum, these resolver paths would be produced
```json
[ 'findUser', '[User]!' ]
[ 'findUser', 0, 'User', 'posts', '[Post!]' ]
[ 'findUser', 0, 'User', 'posts', 0, '[Post!]', 'comments', '[Comment!]' ]
[ 'findUser', 0, 'User', 'posts', 1, '[Post!]', 'comments', '[Comment!]' ]
[ 'findUser', 1, 'User', 'posts', '[Post!]' ]
// ...
[ 'findUser', 2, 'User', 'posts', '[Post!]' ]
// ...
[ 'findUser', 3, 'User', 'posts', '[Post!]' ]
// ...
```

#### Provide resolver path to service hooks

Feathers service hooks presently see `{ graphql: true }`
and so only know that the call is part of a GraphQL call.
This call be changed to `{ graphql: resolverPath }` so that the hook has more information
about the GraphQL call.

#### Return resolver pagination information

Feathers calls whose top-level is paginated return the result
```json
{
  total: 100,
  skip: 0,
  limit: 10,
  data: [ ]
}
```
This proposal will add a `pagination: [{...}, {...}]` to that.

Feathers calls whose top-level is not paginated return the resulting object.
This proposal would return the following **only if any inner pagination occurred**.
```json
{
  pagination: pagination: [{...}, {...}],
  data: [ /* the single resulting object */ ]
}
```

In both cases `pagination` would be an array of objects.
Each object contains pagination information for one resolver route.
and the elements would be in the order of executed resolvers as in the above example.

> Perhaps this is not the best design as it requires searching the array for desired population info.
A hash may be better where the prop is the serialized resolver route ?!?

It would look like
```json
[
  { route: [ 'findUser', '[User]!' ],
    args: query: {uuid: {__lt: 100000}}, 
    pagination: {
      total,
      skip,
      limit
    }
  }
]
```

Only resolver calls with paginated results would be included,
not every resolver call.
So the amount of information should be manageable.

The app can drill down to the pagination information it is interested in,
and use that to modify its __limit and __skip values in the GraphQL arguments.

> BatchLoaders cannot return such information.
In fact, **I'm not sure BatchLoaders** can support pagination without extreme contortion.

..

> **WHAT IS THE POINT OF THIS?**
Will an app actually rerun the **WHOLE** Query must to scroll on an inner paginated record?
Would it need another Query just to scroll those records and any joined records?

..

> **We cannot implement pagaination UNTIL WE HAVE AN ANSWER FOR THIS.**
