'use strict';


const jwt = require('jsonwebtoken'); //has 2 API methods, sign() and verify()
const bcrypt = require('bcrypt'); //used to HASH & compare passwords in DB
const crypto = require('crypto');
const mongoose = require('mongoose');
const debug = require('debug')('http:auth');

const Auth = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  compareHash: { type: String, unique: true },
}, { timestamps: true });

Auth.methods.generatePasswordHash = function(password) {
  debug('calling generatePasswordHash');
  if(!password) return Promise.reject(new Error('Authorization failed. Password required.'));

  return bcrypt.hash(password, 10)
    .then(hash => this.password = hash)
    .then(() => {
      debug('bcrypt.hash success?');
      return this;
    })
    .catch(err => err);
};

Auth.methods.comparePasswordHash = function(password) {
  debug('calling comparePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if(err) return reject(err);
      if(!valid) return reject(new Error('Authorization failed. Password invalid.'));
      debug('comparePasswordHash success, can move forward');
      resolve(this);
    });
  });
};

Auth.methods.generateCompareHash = function() {
  debug('calling generateCompareHash');
  this.compareHash = crypto.randomBytes(32).toString('hex');
  return this.save()
    .then(() => Promise.resolve(this.compareHash))
    .catch(console.error);
};

Auth.methods.generateToken = function() {
  debug('calling generateToken');
  return this.generateCompareHash()
    .then(compareHash => jwt.sign({ token: compareHash }, process.env.APP_SECRET))
    .catch(err => err);
};

module.exports = mongoose.model('auth', Auth);