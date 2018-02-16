'use strict';

const mongoose = require('mongoose');

const Profile = mongoose.Schema({
  gamesPlayed: {
    type: String,
  },
  gamesWon: {
    type: String,
  },
  percentWon: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'auth',
  },
});

module.exports = mongoose.model('profile', Profile);