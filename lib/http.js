'use strict';

const express = require('express');
const http = require('http').createServer(httpHandler);
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./error-handler');

// app setup
const app = express();
const HTTP_PORT = process.env.HTTP_PORT;
const TCP_PORT = process.env.PORT;
const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

// socket stuff
const wsock = require('socket.io').listen(http);
const tcpsock = require('net');

// middleware
app.use(cors());
app.use('/api/v1', router);
require('../route/route-auth')(router);
app.all('/{0,}', (req, res) => errorHandler(new Error('Path error. Route not found.'), res));
