'use strict';
const server = require('../lib/server');
const roles = module.exports = {};

roles.locksmith = {};
roles.locksmith.action = (targeted, user) => {
  let targetedUser = server.all[user.currentserver].activePlayers.filter(player => player.nick === targeted);
  targetedUser.protected = true;
};

roles.theif = {};
roles.theif.action = (targeted, user) => {
  let targetedUser = server.all[user.currentserver].activePlayers.filter(player => player.nick === targeted);
  targetedUser.protected === true ? targetedUser.rob = false : targetedUser.rob = true;
};