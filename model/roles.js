'use strict';
const server = require('../lib/server');
const roles = module.exports = {};

roles.locksmith = {};
roles.locksmith.action = (targeted, user) => {
  let targetedUser = server.all[user.currentserver].activePlayers.filter(player => player.nick === targeted)[0];
  targetedUser.protected = true;
};

roles.theif = {};
roles.theif.action = (targeted, user) => {
  let targetedUser = server.all[user.currentserver].activePlayers.filter(player => player.nick === targeted)[0];
  targetedUser.protected === true ? targetedUser.rob = false : targetedUser.rob = true;
};

roles.dentist = {};
roles.dentist.action = (targeted, user) => {
  let targetedUser = server.all[user.currentserver].activePlayers.filter(player => player.nick === targeted)[0];
  targetedUser.mute === true;
};

roles.jailor = {};
roles.jailor.action = (targeted, user) => {
  let targetedUser = server.all[user.currentserver].activePlayers.filter(player => player.nick === targeted)[0];
  targetedUser.jail === true;
};

roles.cop = {};
roles.cop.action = (targeted, user) => {
  let targetedUser = server.all[user.currentserver].activePlayers.filter(player => player.nick === targeted)[0];
  targetedUser.affiliation === 'theif' ? 'theif' : 'town';
};

roles.creeper = {};
roles.creeper.action = (targeted, user) => {
  let targetedUser = server.all[user.currentserver].activePlayers.filter(player => player.nick === targeted)[0];
  targetedUser.creepin = true;
};

roles.theifrecruiter = {};
roles.theifrecruiter.action = (targeted, user) => {
  let targetedUser = server.all[user.currentserver].activePlayers.filter(player => player.nick === targeted)[0];
  targetedUser.affiliation = 'theif';
  targetedUser.role = 'THIEF';
};