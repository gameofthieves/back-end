'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Auth = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  compareHash: { type: String, unique: true },
}, { timestamps: true });

// Do 4 operations on any instance of our auth model
// 1. Generate a password hash - hash their password and set it on the password property.
Auth.methods.generatePasswordHash = function (password) {
  if (!password) return Promise.reject(new Error('Authorization failed. Password required.'));
  // takes in user's password input and second argument is saltRounds - default normally base 10. Amount of encryption steps to go through to generate the hash; time to complete goes up exponentially.
  return bcrypt.hash(password, 10)
  // hash of the password gets passed to callback
    .then(hash => this.password = hash)
  // if successful, this method returns the user
    .then(() => this)
    .catch(err => err);
};

// 2. After someone signs up, compare what they've sent to the hashed password in DB.
Auth.methods.comparePasswordHash = function (password) {
  // returns new Promise object in order to get compare to work, with callback
  return new Promise((resolve, reject) => {
    // only two arguments passed to valid is true or false
    bcrypt.compare(password, this.password, (err, valid) => {
      if (err) return reject(err);
      if (!valid) return reject(new Error('Authorization failed. Password invalid.'));
      resolve(this);
    });
  });
};

// 3. After authenticating someone, generate a compare hash for their token.
Auth.methods.generateCompareHash = function () {
  // creates UUID style data
  this.compareHash = crypto.randomBytes(32).toString('hex');
  // Try to save the data after we generate the random hex value
  return this.save()
  // send back the hash
    .then(() => Promise.resolve(this.compareHash))
  // should set up a helper function in the .catch with a counter - in case the hash is not unique, can regenerate the hash x number of times. For now we are just calling the function until we get a unique compare hash.
    .catch(() => this.generateCompareHash());
};

// 4. Then send them a token so that they don't have to resend authentication each time to API.
Auth.methods.generateToken = function () {
  return this.generateCompareHash()
  // get the hash back from the generateCompareHash method, which on success returns a promise 
  // two jwt methods, sign and verify. Send in the hash and app secret, and this generates a token
    .then(compareHash => jwt.sign({ token: compareHash }, process.env.APP_SECRET))
    .catch(err => err);
};

module.exports = mongoose.model('auth', Auth);