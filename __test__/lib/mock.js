'use strict';

const faker = require('faker');
const Auth = require('../../model/auth');
// const Gallery = require('../../model/gallery');
// const Profile = require('../../model/profile');
const debug = require('debug')('http:mock');

const mock = module.exports = {};

/* NESTED MOCK OBJECTS */
mock.auth = {};
// mock.gallery = {};
mock.profile = {};

/* AUTH MOCKS */
mock.auth.createOne = () => {
  let result = {};
  result.password = faker.name.lastName();

  debug('about to create a new mock.auth');
  return new Auth({
    username: faker.name.firstName(),
    email: faker.internet.email(),
  })
    .generatePasswordHash(result.password)
    .then(auth => result.auth = auth)
    .then(auth => auth.generateToken())
    .then(token => result.token = token)
    .then(() => {
      // debug(`mock createOne result: ${result}`);
      debug(`mock createOne result.auth: ${result.auth}`);
      debug(`mock createOne result.token: ${result.token}`);
      return result;
    });
};

/* GALLERY MOCKS */
// mock.gallery.createOne = () => {
//   let resultMock = {};

//   return mock.auth.createOne()
//     .then(createdAuthMock => resultMock = createdAuthMock)
//     .then(createdAuthMock => {
//       return new Gallery({
//         name: faker.internet.domainWord(),
//         description: faker.lorem.words(15),
//         userId: createdAuthMock.auth._id,
//       }).save();
//     })
//     .then(gallery => {
//       resultMock.gallery = gallery;
//       console.log(resultMock);
//       debug('galleryMock created, about to return');
//       return resultMock;
//     });
// };

/* MOCK REMOVALS */
mock.auth.removeAll = () => Promise.all([Auth.remove()]);