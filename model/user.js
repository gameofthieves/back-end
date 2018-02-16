'use strict';
const faker = require('faker');

module.exports = function (socket) {
  this.socket = socket;
  this.nick = faker.name.prefix() + faker.name.firstName();
  this.currentServer = 'login';
};