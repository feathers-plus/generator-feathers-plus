
/* eslint-disable no-unused-vars */
// Define GraphQL resolvers using Feathers services and BatchLoaders. (Can be re-generated.)
const { getByDot, setByDot } = require('feathers-hooks-common');
//!code: imports //!end

// Our handle to the GraphQL content
let graphqlContent;
//!code: init //!end

let moduleExports = function batchLoaderResolvers(app, options) {
  // eslint-disable-next-line
  let { convertArgsToParams, convertArgsToFeathers, extractAllItems, extractFirstItem,
    feathersBatchLoader: { feathersBatchLoader } } = options;
  //!<DEFAULT> code: max-batch-size
  let defaultPaginate = app.get('paginate');
  let maxBatchSize = defaultPaginate && typeof defaultPaginate.max === 'number' ?
    defaultPaginate.max : undefined;
  //!end

  //!<DEFAULT> code: services
  let comment = app.service('/comment');
  let like = app.service('/like');
  let post = app.service('/post');
  let relationship = app.service('/relationship');
  let user = app.service('/user');
  //!end

  //!<DEFAULT> code: get-result
  // Given a fieldName in the parent record, return the result from a BatchLoader
  // The result will be an object (or null), or an array of objects (possibly empty).
  function getResult(batchLoaderName, fieldName, isArray) {
    const contentByDot = `batchLoaders.${batchLoaderName}`;

    // `content.app = app` is the Feathers app object.
    // `content.batchLoaders = {}` is where the BatchLoaders for a request are stored.
    return (parent, args, content, ast) => {
      let batchLoader = getByDot(content, contentByDot);

      if (!batchLoader) {
        batchLoader = getBatchLoader(batchLoaderName, parent, args, content, ast);
        setByDot(content, contentByDot, batchLoader);
      }

      const returns = batchLoader.load(parent[fieldName]);
      return !isArray ? returns : returns.then(result => result || []);
    };
  }
  //!end

  // A transient BatchLoader can be created only when (one of) its resolver has been called,
  // as the BatchLoader loading function may require data from the 'args' passed to the resolver.
  // Note that each resolver's 'args' are static throughout a GraphQL call.
  function getBatchLoader(dataLoaderName, parent, args, content, ast) {
    let feathersParams;

    switch (dataLoaderName) {
    /* Persistent BatchLoaders. Stored in `content.batchLoaders._persisted`. */
    //!<DEFAULT> code: bl-persisted
    // case '_persisted.user.one.id': // service user, returns one object, key is field id
    //!end

    /* Transient BatchLoaders shared among resolvers. Stored in `content.batchLoaders._shared`. */
    //!code: bl-shared
    // *.*: User
    case '_shared.user.one.uuid': // service user, returns one object, key is field uuid
      return feathersBatchLoader(dataLoaderName, '!', 'uuid',
        keys => {
          feathersParams = convertArgsToFeathers(args, graphqlContent, null,
            { query : { uuid: { $in: keys } } }
          );
          return user.find(feathersParams);
        },
        50
      );
    //!end

    /* Transient BatchLoaders used by only one resolver. Stored in `content.batchLoaders`. */

    // Comment.author: User!
    //!code: bl-Comment-author
      // ... Using instead _shared.user.one.id
      //!end

    // Comment.likes: [Like!]
    //!<DEFAULT> code: bl-Comment-likes
    case 'Comment.likes':
      return feathersBatchLoader(dataLoaderName, '[!]', 'commentUuid',
        keys => {
          feathersParams = convertArgsToFeathers(args, graphqlContent, null, {
            query: { commentUuid: { $in: keys }, $sort: undefined },
            _populate: 'skip', paginate: false
          });
          return like.find(feathersParams);
        },
        maxBatchSize // Max #keys in a BatchLoader func call.
      );
    //!end

    // Like.author: User!
    //!code: bl-Like-author
      // ... Using instead _shared.user.one.id
      //!end

    // Like.comment: Comment!
    //!<DEFAULT> code: bl-Like-comment
    case 'Like.comment':
      return feathersBatchLoader(dataLoaderName, '!', 'uuid',
        keys => {
          feathersParams = convertArgsToFeathers(args, graphqlContent, null, {
            query: { uuid: { $in: keys }, $sort: undefined },
            _populate: 'skip', paginate: false
          });
          return comment.find(feathersParams);
        },
        maxBatchSize // Max #keys in a BatchLoader func call.
      );
    //!end

    // Post.author: User!
    //!code: bl-Post-author
      // ... Using instead _shared.user.one.id
      //!end

    // Post.comments: [Comment!]
    //!<DEFAULT> code: bl-Post-comments
    case 'Post.comments':
      return feathersBatchLoader(dataLoaderName, '[!]', 'postUuid',
        keys => {
          feathersParams = convertArgsToFeathers(args, graphqlContent, null, {
            query: { postUuid: { $in: keys }, $sort: undefined },
            _populate: 'skip', paginate: false
          });
          return comment.find(feathersParams);
        },
        maxBatchSize // Max #keys in a BatchLoader func call.
      );
    //!end

    // Relationship.follower: User!
    //!code: bl-Relationship-follower
      // ... Using instead _shared.user.one.id
      //!end

    // Relationship.followee: User!
    //!code: bl-Relationship-followee
      // ... Using instead _shared.user.one.id
      //!end

    // User.comments: [Comment!]
    //!<DEFAULT> code: bl-User-comments
    case 'User.comments':
      return feathersBatchLoader(dataLoaderName, '[!]', 'authorUuid',
        keys => {
          feathersParams = convertArgsToFeathers(args, graphqlContent, null, {
            query: { authorUuid: { $in: keys }, $sort: undefined },
            _populate: 'skip', paginate: false
          });
          return comment.find(feathersParams);
        },
        maxBatchSize // Max #keys in a BatchLoader func call.
      );
    //!end

    // User.followed_by: [Relationship!]
    //!<DEFAULT> code: bl-User-followed_by
    case 'User.followed_by':
      return feathersBatchLoader(dataLoaderName, '[!]', 'followeeUuid',
        keys => {
          feathersParams = convertArgsToFeathers(args, graphqlContent, null, {
            query: { followeeUuid: { $in: keys }, $sort: undefined },
            _populate: 'skip', paginate: false
          });
          return relationship.find(feathersParams);
        },
        maxBatchSize // Max #keys in a BatchLoader func call.
      );
    //!end

    // User.following: [Relationship!]
    //!<DEFAULT> code: bl-User-following
    case 'User.following':
      return feathersBatchLoader(dataLoaderName, '[!]', 'followerUuid',
        keys => {
          feathersParams = convertArgsToFeathers(args, graphqlContent, null, {
            query: { followerUuid: { $in: keys }, $sort: undefined },
            _populate: 'skip', paginate: false
          });
          return relationship.find(feathersParams);
        },
        maxBatchSize // Max #keys in a BatchLoader func call.
      );
    //!end

    // User.likes: [Like!]
    //!<DEFAULT> code: bl-User-likes
    case 'User.likes':
      return feathersBatchLoader(dataLoaderName, '[!]', 'authorUuid',
        keys => {
          feathersParams = convertArgsToFeathers(args, graphqlContent, null, {
            query: { authorUuid: { $in: keys }, $sort: undefined },
            _populate: 'skip', paginate: false
          });
          return like.find(feathersParams);
        },
        maxBatchSize // Max #keys in a BatchLoader func call.
      );
    //!end

    // User.posts(query: JSON, params: JSON, key: JSON): [Post!]
    //!code: bl-User-posts
    case 'User.posts':
      return feathersBatchLoader(dataLoaderName, '[!]', 'authorUuid',
        keys => {
          feathersParams = convertArgsToFeathers(args, graphqlContent, null,
            { query: { authorUuid: { $in: keys }, $sort: { uuid: 1 } }, populate: false }
          );
          return post.find(feathersParams);
        }
      );
    //!end

    /* Throw on unknown BatchLoader name. */
    default:
      //!<DEFAULT> code: bl-default
      throw new Error(`GraphQL query requires BatchLoader named '${dataLoaderName}' but no definition exists for it.`);
      //!end
    }
  }

  let returns = {

    Comment: {

      // author: User!
      //!code: resolver-Comment-author
      author: getResult('_shared.user.one.uuid', 'authorUuid'),
      //!end

      // likes: [Like!]
      //!<DEFAULT> code: resolver-Comment-likes
      likes: getResult('Comment.likes', 'uuid', true),
      //!end
    },

    Like: {

      // author: User!
      //!code: resolver-Like-author
      author: getResult('_shared.user.one.uuid', 'authorUuid'),
      //!end

      // comment: Comment!
      //!<DEFAULT> code: resolver-Like-comment
      comment: getResult('Like.comment', 'commentUuid'),
      //!end
    },

    Post: {

      // author: User!
      //!code: resolver-Post-author
      author: getResult('_shared.user.one.uuid', 'authorUuid'),
      //!end

      // comments: [Comment!]
      //!<DEFAULT> code: resolver-Post-comments
      comments: getResult('Post.comments', 'uuid', true),
      //!end
    },

    Relationship: {

      // follower: User!
      //!code: resolver-Relationship-follower
      follower: getResult('_shared.user.one.uuid', 'followerUuid'),
      //!end

      // followee: User!
      //!code: resolver-Relationship-followee
      followee: getResult('_shared.user.one.uuid', 'followeeUuid'),
      //!end
    },

    User: {

      // comments: [Comment!]
      //!<DEFAULT> code: resolver-User-comments
      comments: getResult('User.comments', 'uuid', true),
      //!end

      // followed_by: [Relationship!]
      //!<DEFAULT> code: resolver-User-followed_by
      followed_by: getResult('User.followed_by', 'uuid', true),
      //!end

      // following: [Relationship!]
      //!<DEFAULT> code: resolver-User-following
      following: getResult('User.following', 'uuid', true),
      //!end

      // fullName: String!
      //!code: resolver-User-fullName-non
      fullName: ({ firstName, lastName }, args, context, ast) => `${firstName} ${lastName}`,
      //!end

      // likes: [Like!]
      //!<DEFAULT> code: resolver-User-likes
      likes: getResult('User.likes', 'uuid', true),
      //!end

      // posts(query: JSON, params: JSON, key: JSON): [Post!]
      //!<DEFAULT> code: resolver-User-posts
      posts: getResult('User.posts', 'uuid', true),
      //!end
    },

    //!code: resolver_field_more //!end
    Query: {

      //!<DEFAULT> code: query-Comment
      // getComment(query: JSON, params: JSON, key: JSON): Comment
      getComment (parent, args, content, ast) {
        graphqlContent = content;
        const feathersParams = convertArgsToFeathers(args, content, ast);
        return comment.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findComment(query: JSON, params: JSON): [Comment!]
      findComment(parent, args, content, ast) {
        graphqlContent = content;
        const feathersParams = convertArgsToFeathers(args, content, ast, { query: { $sort: {   uuid: 1 } } });
        return comment.find(feathersParams).then(paginate(content)).then(extractAllItems);
      },
      //!end

      //!<DEFAULT> code: query-Like
      // getLike(query: JSON, params: JSON, key: JSON): Like
      getLike (parent, args, content, ast) {
        graphqlContent = content;
        const feathersParams = convertArgsToFeathers(args, content, ast);
        return like.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findLike(query: JSON, params: JSON): [Like!]
      findLike(parent, args, content, ast) {
        graphqlContent = content;
        const feathersParams = convertArgsToFeathers(args, content, ast, { query: { $sort: {   uuid: 1 } } });
        return like.find(feathersParams).then(paginate(content)).then(extractAllItems);
      },
      //!end

      //!<DEFAULT> code: query-Post
      // getPost(query: JSON, params: JSON, key: JSON): Post
      getPost (parent, args, content, ast) {
        graphqlContent = content;
        const feathersParams = convertArgsToFeathers(args, content, ast);
        return post.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findPost(query: JSON, params: JSON): [Post!]
      findPost(parent, args, content, ast) {
        const feathersParams = convertArgsToFeathers(args, content, ast, { query: { $sort: {   uuid: 1 } } });
        return post.find(feathersParams).then(paginate(content)).then(extractAllItems);
      },
      //!end

      //!<DEFAULT> code: query-Relationship
      // getRelationship(query: JSON, params: JSON, key: JSON): Relationship
      getRelationship (parent, args, content, ast) {
        graphqlContent = content;
        const feathersParams = convertArgsToFeathers(args, content, ast);
        return relationship.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findRelationship(query: JSON, params: JSON): [Relationship!]
      findRelationship(parent, args, content, ast) {
        graphqlContent = content;
        const feathersParams = convertArgsToFeathers(args, content, ast, { query: { $sort: {   uuid: 1 } } });
        return relationship.find(feathersParams).then(paginate(content)).then(extractAllItems);
      },
      //!end

      //!<DEFAULT> code: query-User
      // getUser(query: JSON, params: JSON, key: JSON): User
      getUser (parent, args, content, ast) {
        graphqlContent = content;
        const feathersParams = convertArgsToFeathers(args, content, ast);
        return user.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findUser(query: JSON, params: JSON): [User!]
      findUser(parent, args, content, ast) {
        graphqlContent = content;
        const feathersParams = convertArgsToFeathers(args, content, ast, { query: { $sort: {   uuid: 1 } } });
        return user.find(feathersParams).then(paginate(content)).then(extractAllItems);
      },
      //!end
      //!code: resolver_query_more //!end
    },
  };

  //!code: func_return //!end
  return returns;
};

//!code: more //!end

//!code: exports //!end
module.exports = moduleExports;

function paginate(content) {
  return result => {
    content.pagination = !result.data ? undefined : {
      total: result.total,
      limit: result.limit,
      skip: result.skip,
    };

    return result;
  };
}
//!code: funcs //!end
//!code: end //!end
