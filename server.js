// database is let instead of const to allow us to modify it in test.js
let database = {
  users: {},
  articles: {},
  nextArticleId: 1,
  comments: {},
  nextCommentId: 1
};

const routes = {
  '/users': {
    'POST': getOrCreateUser
  },
  '/users/:username': {
    'GET': getUser
  },
  '/articles': {
    'GET': getArticles,
    'POST': createArticle
  },
  '/articles/:id': {
    'GET': getArticle,
    'PUT': updateArticle,
    'DELETE': deleteArticle
  },
  '/articles/:id/upvote': {
    'PUT': upvoteArticle
  },
  '/articles/:id/downvote': {
    'PUT': downvoteArticle
  },

  '/comments': {
    'POST': createComment
  },
  '/comments/:id': {
    'PUT': updateComment,
    'DELETE': deleteComment
  },
  '/comments/:id/upvote': {
    'PUT': upVoteComment
  },
  '/comments/:id/downvote': {
    'PUT': downVoteComment
  }
};

function createComment(url, request){
      let response = {};

      const reqBody = request.body;
      const checkForObj = Object.keys(reqBody);
      if (!reqBody.comment) {
        response.status = 400;
      }

if (request.body.comment.body && request.body.comment.username && request.body.comment.articleId &&
database.users[request.body.comment.username] && database.articles[request.body.comment.articleId]){
      let comment = {
        id: database.nextCommentId,
        body: request.body.comment.body,
        username: request.body.comment.username,
        articleId: request.body.comment.articleId,
        upvotedBy: [],
        downvotedBy: []
        };


  //console.log(url + "\n" + request);


      database.comments[comment.id] = comment;
      database.articles[comment.articleId].commentIds.push(comment.id);
      database.users[comment.username].commentIds.push(comment.id);
      database.nextCommentId++;


  response.body = {comment: comment};
  response.status = 201;
} else if(checkForObj.length === 0){
  response.status = 400;

} else {
  response.status = 400;
}

  //console.log(response);
  return response;


}

function updateComment(url, request){
  let response = {};

  const id = Number(url.split('/').filter(segment => segment)[1]);
  const existingComment = database.comments[id];
  const requestedComment = request.body.comment;
  const rComment2 = request.body;
  const obLen = Object.keys(request).length === 0;

  if (!existingComment){
    response.status = 404;
    return response;
  }


  if (!requestedComment || !rComment2){
    response.status = 400;

    return response;
  } else if (!existingComment || !requestedComment.body){
      response.status = 400;

      return response;
  }

  if ((existingComment.id !== requestedComment.id) || (existingComment.username !== requestedComment.username) || (existingComment.articleId !== requestedComment.articleId)){
    response.status = 404;
    return response;
  } else if (!database.comments.hasOwnProperty(id)){
      response.status = 404;
      return response;
  }

  // I'm now making conditions that throw 400 /404 errors

  if (existingComment && requestedComment && id){

  database.comments[id] = requestedComment;
  response.status = 200;
  response.body = {comment: requestedComment};
  }

  return response;


}

function deleteComment (url){
  let response = {};
  const comToDel = Number(url.split('/').filter(partOfUrI => partOfUrI)[1]);
  const savedComment = database.comments[comToDel];



  if (!comToDel || !savedComment){
    response.status = 404;
    return response;
  }

  if (savedComment){
    database.comments[comToDel] = null;

    const userCommentIds = database.users[savedComment.username].commentIds;
    userCommentIds.splice(userCommentIds.indexOf(comToDel), 1);

    const articleCommentIds = database.articles[savedComment.articleId].commentIds;
    articleCommentIds.splice(articleCommentIds.indexOf(comToDel), 1);
    response.status = 204;
    return response;

  }
  return response;

}

function upVoteComment (url, request){
  const response = {};
  const newUpvoteUser = request.body.username;
  const iD = Number(url.split("/").filter(partOfUrI => partOfUrI)[1]);
  const savedComment = database.comments[iD];

  if (!savedComment){
    response.status = 400;
    return response;
  }


  if (!database.users[newUpvoteUser]){
    response.status = 400;
    return response;
  }


  const dV = database.comments[iD].downvotedBy;
  const uV = database.comments[iD].upvotedBy;

  if (uV.indexOf(newUpvoteUser) !== -1){
    response.status = 400;
    return response;
  }

  database.comments[iD].upvotedBy.push(newUpvoteUser);
  if (dV.indexOf(newUpvoteUser) !== -1){
    dV.splice(dV.indexOf(newUpvoteUser), 1);
  }
  response.status = 200;
  response.body = {comment: savedComment};
  return response;
}

function downVoteComment(url, request){
  const response = {};
  const newDownvoteUser = request.body.username;
  const iD = Number(url.split("/").filter(partOfUrI => partOfUrI)[1]);
  const savedComment = database.comments[iD];

  if (!savedComment){
    response.status = 400;
    return response;
  }

  if (savedComment.downvotedBy.indexOf(newDownvoteUser) !== -1){
    response.status = 400;
    return response;
  }

  if (!database.users[newDownvoteUser]){
    response.status = 400;
    return response;
  }

  savedComment.downvotedBy.push(newDownvoteUser);

  if (savedComment.upvotedBy.indexOf(newDownvoteUser) !== -1){
    savedComment.upvotedBy.splice(savedComment.upvotedBy.indexOf(newDownvoteUser), 1);
  }

  response.status = 200;
  response.body = {comment: savedComment};
  return response;


}

function getUser(url, request) {
  //turns url into an array and filters through to return the 2nd element
  const username = url.split('/').filter(segment => segment)[1];
  //returns the user from the database via the url from variable above
  const user = database.users[username];
  // creates an empty object
  const response = {};
  // if user is true:
  if (user) {
    // returns an array iterating through the user array and assigns user
    // article ID's to the element now called articleIds
    const userArticles = user.articleIds.map(
        articleId => database.articles[articleId]);
    // same as above but assigns the array to userComments with comment IDs
    const userComments = user.commentIds.map(
        commentId => database.comments[commentId]);
    // creates an object inside response assigning the variables to attributes
    // with the same names
    response.body = {
      user: user,
      userArticles: userArticles,
      userComments: userComments
    };
    response.status = 200;
  } else if (username) {
    response.status = 404;
  } else {
    response.status = 400;
  }

  return response;
}

function getOrCreateUser(url, request) {
  const username = request.body && request.body.username;
  const response = {};

  if (database.users[username]) {
    response.body = {user: database.users[username]};
    response.status = 200;
  } else if (username) {
    const user = {
      username: username,
      articleIds: [],
      commentIds: []
    };
    database.users[username] = user;

    response.body = {user: user};
    response.status = 201;
  } else {
    response.status = 400;
  }

  return response;
}

function getArticles(url, request) {
  const response = {};

  response.status = 200;
  response.body = {
    articles: Object.keys(database.articles)
        .map(articleId => database.articles[articleId])
        .filter(article => article)
        .sort((article1, article2) => article2.id - article1.id)
  };

  return response;
}

function getArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const article = database.articles[id];
  const response = {};

  if (article) {
    article.comments = article.commentIds.map(
      commentId => database.comments[commentId]);

    response.body = {article: article};
    response.status = 200;
  } else if (id) {
    response.status = 404;
  } else {
    response.status = 400;
  }

  return response;
}

function createArticle(url, request) {
  const requestArticle = request.body && request.body.article;
  const response = {};

  if (requestArticle && requestArticle.title && requestArticle.url &&
      requestArticle.username && database.users[requestArticle.username]) {
    const article = {
      id: database.nextArticleId++,
      title: requestArticle.title,
      url: requestArticle.url,
      username: requestArticle.username,
      commentIds: [],
      upvotedBy: [],
      downvotedBy: []
    };

    database.articles[article.id] = article;
    database.users[article.username].articleIds.push(article.id);

    response.body = {article: article};
    response.status = 201;
  } else {
    response.status = 400;
  }

  return response;
}

function updateArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const savedArticle = database.articles[id];
  const requestArticle = request.body && request.body.article;
  const response = {};

  if (!id || !requestArticle) {
    response.status = 400;
  } else if (!savedArticle) {
    response.status = 404;
  } else {
    savedArticle.title = requestArticle.title || savedArticle.title;
    savedArticle.url = requestArticle.url || savedArticle.url;

    response.body = {article: savedArticle};
    response.status = 200;
  }

  return response;
}

function deleteArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const savedArticle = database.articles[id];
  const response = {};

  if (savedArticle) {
    database.articles[id] = null;
    savedArticle.commentIds.forEach(commentId => {
      const comment = database.comments[commentId];
      database.comments[commentId] = null;
      const userCommentIds = database.users[comment.username].commentIds;
      userCommentIds.splice(userCommentIds.indexOf(id), 1);
    });
    const userArticleIds = database.users[savedArticle.username].articleIds;
    userArticleIds.splice(userArticleIds.indexOf(id), 1);
    response.status = 204;
  } else {
    response.status = 400;
  }

  return response;
}

function upvoteArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const username = request.body && request.body.username;
  let savedArticle = database.articles[id];
  const response = {};

  if (savedArticle && database.users[username]) {
    savedArticle = upvote(savedArticle, username);

    response.body = {article: savedArticle};
    response.status = 200;
  } else {
    response.status = 400;
  }

  return response;
}

function downvoteArticle(url, request) {
  const id = Number(url.split('/').filter(segment => segment)[1]);
  const username = request.body && request.body.username;
  let savedArticle = database.articles[id];
  const response = {};

  if (savedArticle && database.users[username]) {
    savedArticle = downvote(savedArticle, username);

    response.body = {article: savedArticle};
    response.status = 200;
  } else {
    response.status = 400;
  }

  return response;
}

function upvote(item, username) {
  if (item.downvotedBy.includes(username)) {
    item.downvotedBy.splice(item.downvotedBy.indexOf(username), 1);
  }
  if (!item.upvotedBy.includes(username)) {
    item.upvotedBy.push(username);
  }
  return item;
}

function downvote(item, username) {
  if (item.upvotedBy.includes(username)) {
    item.upvotedBy.splice(item.upvotedBy.indexOf(username), 1);
  }
  if (!item.downvotedBy.includes(username)) {
    item.downvotedBy.push(username);
  }
  return item;
}

/*function comments(url, request) {



}*/

// Write all code above this line.

const http = require('http');
const url = require('url');

const port = process.env.PORT || 4000;
const isTestMode = process.env.IS_TEST_MODE;

const requestHandler = (request, response) => {
  const url = request.url;
  const method = request.method;
  const route = getRequestRoute(url);

  if (method === 'OPTIONS') {
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
    response.writeHead(200, headers);
    return response.end();
  }

  response.setHeader('Access-Control-Allow-Origin', null);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader(
      'Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  if (!routes[route] || !routes[route][method]) {
    response.statusCode = 400;
    return response.end();
  }

  if (method === 'GET' || method === 'DELETE') {
    const methodResponse = routes[route][method].call(null, url);
    !isTestMode && (typeof saveDatabase === 'function') && saveDatabase();

    response.statusCode = methodResponse.status;
    response.end(JSON.stringify(methodResponse.body) || '');
  } else {
    let body = [];
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = JSON.parse(Buffer.concat(body).toString());
      const jsonRequest = {body: body};
      const methodResponse = routes[route][method].call(null, url, jsonRequest);
      !isTestMode && (typeof saveDatabase === 'function') && saveDatabase();

      response.statusCode = methodResponse.status;
      response.end(JSON.stringify(methodResponse.body) || '');
    });
  }
};

const getRequestRoute = (url) => {
  const pathSegments = url.split('/').filter(segment => segment);

  if (pathSegments.length === 1) {
    return `/${pathSegments[0]}`;
  } else if (pathSegments[2] === 'upvote' || pathSegments[2] === 'downvote') {
    return `/${pathSegments[0]}/:id/${pathSegments[2]}`;
  } else if (pathSegments[0] === 'users') {
    return `/${pathSegments[0]}/:username`;
  } else {
    return `/${pathSegments[0]}/:id`;
  }
}

if (typeof loadDatabase === 'function' && !isTestMode) {
  const savedDatabase = loadDatabase();
  if (savedDatabase) {
    for (key in database) {
      database[key] = savedDatabase[key] || database[key];
    }
  }
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('Server did not start succesfully: ', err);
  }

  console.log(`Server is listening on ${port}`);
});
