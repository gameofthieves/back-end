'use strict';

const User = require('../../model/user');
const server = require('../../lib/server');


const superagent = require('superagent');
const net = require('net');
const PORT = process.env.PORT;

describe('user.js', () => {
  it('should return a property from the user object', () => {

    let client = net.connect({port: 3000});
    client.on('connection', data => {
      console.log('USERDATA', data);
      client.end();
    });

    client.on('end', () => {
      console.log('user test ending');
    });
  });
});
