'use strict';

const mongoose = require('mongoose');
const faker = require('faker');

const User = mongoose.Schema({
  nickname: faker.name.findName()
  role: {}
});

module.exports = mongoose.model('user', User);