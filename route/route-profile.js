'use strict';

const bodyParser = require('body-parser').json();
const Profile = require('../model/profile');
const errorHandler = require('../lib/error-handler');

module.exports = function (router) {
  // No post as all users' profiles are created when they register

  router.get('/profile/:userId', (req, res) => {
    let result = {};
    if (req.params.userId) {
      Profile.findOne({ userId: req.params.userId })
        .then(profile => {
          result = profile;
        })
        .then(() => res.status(200).send(result))
        .catch(err => errorHandler(err, res));
    }
  });

  //   router.get('/profile/:_id?', (req, res) => {
  //     // returns one profile
  //     if (req.params._id) {
  //       return Profile.findById(req.params._id)
  //         .then(profile => res.status(200).json(profile))
  //         .catch(err => errorHandler(err, res));
  //     }

  //     // returns all profiles
  //     return Profile.find()
  //       .then(profiles => {
  //         let profileIds = profiles.map(profile => profile._id);
  //         return res.status(200).json(profileIds);
  //       })
  //       .catch(err => errorHandler(err, res));
  //   });

  router.put('/profile/:_id?', bodyParser, (req, res) => {
    console.log('in put');
    Profile.findById(req.params._id, req.body)
      .then(profile => {
        if (profile._id.toString() === req.params._id.toString()) {
          profile.gamesPlayed = Number(req.body.gamesPlayed);
          profile.gamesWon = Number(req.body.gamesWon);
          return profile.save();
        }
        return errorHandler(new Error('Validation error. Invalid ID.'), res);
      })
      // res.status() sets the http status on the response. res.sendStatus() both sets and sends the status to the client.
      .then(() => res.sendStatus(204))
      .catch(err => errorHandler(err, res));
  });

  router.delete('/note/:_id?', (req, res) => {
    return Profile.findById(req.params._id)
      .then(profile => {
        if (profile._id.toString() === req.params._id.toString()) return profile.remove();
        return errorHandler(new Error('Validation error. Invalid ID.'), res);
      })
      .then(() => res.sendStatus(204))
      .catch(err => errorHandler(err, res));
  });
};