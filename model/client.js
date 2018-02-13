'use strict';

const uuid = require('uuid');
const faker = require('faker');

module.exports = function(socket) { //exports function accepting socket parameter
  this.socket = socket; //assigns client instance's socket to the given socket parameter
  this.nickname = `${faker.lorem.word()}`; //assigns visible client nickname
  this.user = uuid('uuid/v4');
  this.affiliation = 'town';
  this.vote = 0;
};