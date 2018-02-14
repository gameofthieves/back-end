'use strict';

const Auth = require('../model/auth');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const basicAuth = require('../lib/basic-auth-middleware');
const debug = require('debug')('http:route-auth');

module.exports = function(router) {
  router.post('/signup', bodyParser, (req, res) => {
    debug(`router.post, calling user.generatePasswordHash`);
    let password = req.body.password;
    delete req.body.password;

    let user = new Auth(req.body);

    user.generatePasswordHash(password)
      .then(newUser => {
        debug('generatePassHash returned value, about to save');
        return newUser.save();
      })
      .then(userRes => {
        debug('user saved, calling generateToken');
        return userRes.generateToken();
      })
      .then(token => res.status(201).json(token))
      .catch(err => errorHandler(err, res));
  });

  router.get('/signin', basicAuth, (req, res) => {
    debug('router.get, calling Auth.findOne');
    Auth.findOne({ username: req.auth.username })
      .then(user => {
        return user
          ? user.comparePasswordHash(req.auth.password)
          : Promise.reject(new Error('Authorization Failed. User not found.'));
      })
      .then(user => {
        delete req.headers.authorization;
        delete req.auth.password;
        return user;
      })
      .then(user => user.generateToken())
      .then(token => res.status(200).json(token))
      .catch(err => errorHandler(err, res));
  });
};