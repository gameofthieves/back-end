'use strict';
const server = require('../lib/server');
const roles = module.exports = {};

roles.thiefrecruiter = {
  name: 'THIEF RECRUITER',
  order: 1,
  alignment: 'thief',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('recruited');
  },
};

roles.jailor = {
  name: 'JAILOR',
  order: 2,
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('jailed');
  },
};

roles.locksmith = {
  name: 'LOCKSMITH',
  order: 3,
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('protected');
  },
};

roles.cop = {
  name: 'COP',
  order: 4,
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('investigated');
  },
};

roles.dentist = {
  name: 'DENTIST',
  order: 5,
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('muted');
  },
};

roles.thief = {
  name: 'THIEF',
  order: 6,
  alignment: 'thief',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('robbed');
  },
};

roles.creeper = {
  name: 'CREEPER',
  order: 7,
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('creeped');
  },
};