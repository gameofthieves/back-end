'use strict';
const uuid = require('uuid');
const faker = require('faker');

module.exports = function (socket) {
  this.socket = socket;
  this.user = uuid('uuid/v4');
  this.nick = faker.name.prefix() + faker.name.firstName();
  this.currentServer = 'home';
  this.affiliation = 'town';
  this.vote = 0;
  this.role = null;
};