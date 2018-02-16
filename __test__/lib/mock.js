'use strict';

const faker = require('faker');
const superagent = require('superagent');
const Auth = require('../../model/auth');
const Profile = require('../../model/profile');
const path = `:${process.env.HTTP_PORT}/api/v1/`;
const mocks = module.exports = {};

// Auth Mocks
mocks.auth = {};

mocks.auth.createOne = () => {
  let result = {};
  result.password = faker.internet.password();

  let mockUser = new Auth({
    username: faker.internet.userName(),
  });

  return mockUser.generatePasswordHash(result.password)
    .then(user => result.user = user)
    .then(user => user.generateToken())
    .then(token => result.token = token)
    .then(() => {
      return result;
    });
};

// // Profile Mocks
mocks.profile = {};

mocks.profile.createOne = () => {
  let result = {};

  return mocks.auth.createOne()
    .then(user => result = user)
    .then(userMock => {
      return new Profile({
        gamesPlayed: (faker.random.number()).toString(),
        gamesWon: (faker.random.number()).toString(),
        percentWon: (faker.random.number()).toString(),
        username: userMock.user.username,
        userId: userMock.user._id,
      }).save();
    })
    .then(profile => {
      result.profile = profile;
      return result;
    });
};

// Remove
mocks.auth.removeAll = () => Promise.all([Auth.remove()]);
mocks.profile.removeAll = () => Promise.all([Note.remove()]);