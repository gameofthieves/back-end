'use strict';
const uuid = require('uuid');
const faker = require('faker');

module.exports = function (socket) {
  this.socket = socket;
  this.user = uuid('uuid/v4');
  this.nick = faker.name.prefix() + faker.name.firstName();
  this.currentServer = 'home';
  this.alignment = null;
  this.votedFor = null;
  this.role = 'Not assigned';
  this.targeting = null;
  this.targeted = ['none'];
  this.converted = false;
  this.mute = false;
  //   this.actions = 'None';
  this.lastwords = 'None';
};