'use strict';
const uuid = require('uuid');
const faker = require('faker');

module.exports = function (socket) {
  this.socket = socket;
  this.user = uuid('uuid/v4');
  this.nick = faker.name.prefix() + faker.name.firstName();
  this.currentServer = 'home';
  this.affiliation = null;
  this.votingFor = null;
  this.role = 'Not assigned';
  //   this.actions = 'None';
  this.lastwords = 'None';
};