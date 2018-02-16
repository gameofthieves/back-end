'use strict';

// app dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./error-handler');

// app setup
const app = express();
const HTTP_PORT = process.env.HTTP_PORT;
const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

// middleware
app.use(cors());
app.use('/api/v1', router);
require('../route/route-auth')(router);
require('../route/route-profile')(router);
app.all('/{0,}', (req, res) => errorHandler(new Error('Connect to gameofthieves.com port 3000 in your terminal to play the game! Visit https://github.com/gameofthieves/back-end/ for full README.'), res));

// server controls
const server = module.exports = {};

server.start = () => {
  return new Promise((resolve, reject) => {
    if (server.isOn) return reject(new Error('Server error. Cannot start server on same port when already running.'));
    server.http = app.listen(HTTP_PORT, () => {
      console.log(`HTTP: Listening on ${HTTP_PORT}`);
      server.isOn = true;
      mongoose.connect(MONGODB_URI);
      return resolve(server);
    });
  });
};

server.stop = () => {
  return new Promise((resolve, reject) => {
    if (!server.isOn) return reject(new Error('Server error. Cannot stop server that is not running.'));
    server.http.close(() => {
      server.isOn = false;
      mongoose.disconnect();
      return resolve();
    });
  });
};