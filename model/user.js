'use strict';
// const Client = require('./client');
const mongoose = require('mongoose');

const User = mongoose.Schema({

});

module.exports = mongoose.model('user', User);