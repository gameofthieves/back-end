'use strict';

const errorHandler = require('./error-handler');
const Auth = require('../model/auth');
const jwt = require('jsonwebtoken');
const debug = require('debug')('http:bearer-auth-middleware');

const ERROR_MESSAGE = 'Authorization Failed';

module.exports = function(request, response, next) {
  let authHeader = request.headers.authorization;
  if(!authHeader) return errorHandler(new Error(ERROR_MESSAGE), response);

  let token = authHeader.split('Bearer ')[1];
  if(!token) return errorHandler(new Error(ERROR_MESSAGE), response);

  jwt.verify(token, process.env.APP_SECRET, (error, decodedValue) => {
    if(error) {
      error.message = ERROR_MESSAGE;
      return errorHandler(error, response);
    }

    Auth.findOne({ compareHash: decodedValue.token })
      .then(user => {
        if(!user) return errorHandler(new Error(ERROR_MESSAGE), response);
        request.user = user;
        debug('Auth.findOne success! about to call next');
        next();
      })
      .catch(error => errorHandler(error, response));
  });
};