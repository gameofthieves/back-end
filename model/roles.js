'use strict';
const roles = module.exports = {};

roles.thiefrecruiter = {
  name: 'THIEF RECRUITER',
  alignment: 'thief',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('recruited');
  },
};

roles.jailor = {
  name: 'JAILOR',
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('jailed');
  },
};

roles.locksmith = {
  name: 'LOCKSMITH',
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('protected');
  },
};

roles.cop = {
  name: 'COP',
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('investigated');
  },
};

roles.dentist = {
  name: 'DENTIST',
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('muted');
  },
};

roles.thief = {
  name: 'THIEF',
  alignment: 'thief',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('robbed');
  },
};

roles.creeper = {
  name: 'CREEPER',
  alignment: 'town',
  action: function (targeted, user) {
    user.targeting = targeted;
    targeted.targeted.push('creeped');
  },
};