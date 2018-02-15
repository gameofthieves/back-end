'use strict';

const Auth = require('../model/auth');
const basicAuth = require('../lib/basic-auth-middleware');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');

module.exports = function (router) {
  router.post('/register', bodyParser, (req, res) => {
    let result = {};
    result.password = req.body.password;
    delete req.body.password;

    // pass remaining request body (username and email) into Auth model and store as temporary instance of model
    let user = new Auth(req.body);

    return user.generatePasswordHash(result.password)
    // user is returned in the method so that we can save the user. User is now set with hashed password in DB.
      .then(newUser => {
        result = newUser;
        return newUser.save();
      })
      .then(userRes => userRes.generateToken())
    // sending token back in body of response
      .then(() => res.status(201).send(result))
      .catch(err => errorHandler(err, res));
  });

  router.get('/login', basicAuth, (req, res) => {
    let result = {};
    Auth.findOne({ username: req.auth.username })
      .then(user => {
        result = user;
        return user
          ? user.comparePasswordHash(req.auth.password)
          : Promise.reject(new Error('Authorization failed. User not found.'));
      })
      .then(user => {
        delete req.headers.authorization;
        delete req.auth.password;
        return user;
      })
      .then(user => user.generateToken())
      .then(() => res.status(200).send(result))
      .catch(err => errorHandler(err, res));
  });
};