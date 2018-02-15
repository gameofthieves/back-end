'use strict';

const mongoose = require('mongoose');

const Profile = mongoose.Schema({
  gamesPlayed: {
    type: Number,
  },
  gamesWon: {
    type: Number,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'auth',
  },
});

module.exports = mongoose.model('profile', Profile);