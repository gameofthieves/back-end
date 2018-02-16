'use strict';

const bodyParser = require('body-parser').json();
const Profile = require('../model/profile');
const errorHandler = require('../lib/error-handler');

module.exports = function (router) {
  // No post as all users' profiles are created when they register

  router.get('/profile/:userId', (req, res) => {
    let result = {};
    if (req.params.userId) {
      return Profile.findOne({ userId: req.params.userId })
        .then(profile => {
          result = profile;
        })
        .then(() => res.status(200).send(result))
        .catch(err => errorHandler(err, res));
    }
  });

  router.get('/profile', (req, res) => {
    let result = [];
    return Profile.find()
      .then(profiles => {
        profiles.forEach(profile => result.push([profile.percentWon, profile]));
        return res.status(200).send(result);
      })
      .catch(err => errorHandler(err, res));
  });

  router.put('/profile/:_id?', bodyParser, (req, res) => {
    Profile.findById(req.params._id, req.body)
      .then(profile => {
        if (profile._id.toString() === req.params._id.toString()) {
          profile.gamesPlayed = req.body.gamesPlayed;
          profile.gamesWon = req.body.gamesWon;
          profile.percentWon = req.body.percentWon;
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