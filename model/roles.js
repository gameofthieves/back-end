'use strict';

const mongoose = require('mongoose');

const Role = mongoose.Schema({
  alignment: {type: String, required: true},
  locksmith: {type: Boolean},
  cop: {type: Boolean},
  jailor: {type: Boolean},
  creeper: {type: Boolean},
  dentist: {type: Boolean},
  theif: {type: Boolean},
  recruiter: {type: Boolean}, 
});

module.exports = mongoose.model('role', Role);