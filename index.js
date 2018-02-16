'use strict';

require('dotenv').config();

// start net server
require('./lib/server').start();

// start http server
require ('./lib/http').start();
