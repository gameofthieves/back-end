'use strict';

const errorHandler = require('./error-handler');

// 1. unpackage request headers
// 2. break apart value of authorization header to make sure it has right structure
// 3. make sure there is username and password as well
// 4. take the username and pwd and package it up on the req.auth object to pass the content forward
module.exports = function (req, res, next) {
  let authHeaders = req.headers.authorization;
  if (!authHeaders)
    return errorHandler(new Error('Authorization failed. Headers do not match requirements.'), res);

  // looking for base64 encoded username and password just after space. Array gives you empty string and base64 encoding.
  let base64 = authHeaders.split('Basic ')[1];
  if (!base64)
    return errorHandler(new Error('Authorization failed. Username and password required.'), res);

  // passing base64 encoded string into a buffer, notify buffer it is a base64 encoding, and we are stringing it back to utf-8 -- effectively decoding.
  let [username, password] = Buffer.from(base64, 'base64').toString().split(':');
  req.auth = { username, password };

  if (!req.auth.username || !req.auth.password) return errorHandler(new Error('Authorization failed. Username and password required.'), res);

  next();
};