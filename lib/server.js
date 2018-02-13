'use strict';

const net = require('net');
const Client = require('../model/client');
const cmd = require('../lib/cmd');
const User = require('../model/user');
const mongoose = require('mongoose');

const server = module.exports = net.createServer();
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
let clientPool = [];
let rolePool = [];

server.on('connection', function(socket) { //Node net module event, emitted when a new connection is made
  let user = new User();
  let client = new Client(socket);
  user.client = client;
  // console.log(user);
  console.log('user.client', user.client);
  console.log('client', client);

  clientPool.push(client);
  clientPool.map(c => c.socket.write(`${client.nickname} has joined the channel\n`));

  socket.on('data', function(data) { //Node net module event, emitted when data is received on socket, data will be buffer or string
    let msg = cmd(data, clientPool); //declare msg to be cmd function from cmd module, passing data and the client pool as arguments
    socket.emit(msg.command, msg); //uses command returned from cmd.js, depending on users entry (e.g. {command: nickname, name: <entered-name>})
  });

  socket.on('close', function() { //Node net module event, emitted once socket is fully closed
    clientPool = clientPool.filter(c => c.user !== client.user); //filters out clients other than user entering @quit command or erroring out
    clientPool.map(c => c.socket.write(`${client.nickname} has left the channel\n`)); //map through clientPool and write to all remaining clients that the user has left channel
    socket.end(); //closes socket connection explicitly as mentioned in Node net module docs (see Event: 'end' on net.Socket class for details)
  });

  socket.on('error', function(data) { //Node net module event, emmitted when an error occurs, the close event will be called directly following this event
    client.socket.write(`ERROR: ${data.err}\n`); //writes to client who incurred error the error passed as property of data object from cmd.js
  });

  socket.on('list', function() {
    client.socket.write(`\nConnected Users:\n`); //writes header for list of users to client who entered command
    clientPool.map(c => client.socket.write(`\t${c.nickname}\n`)); //maps through clientPool and writes nickname of each client to user who entered command
  });

  socket.on('nickname', function(data) {
    clientPool.map(c => c.socket.write(`\t${client.nickname} changed their name to ${data.name}\n`)); //maps through clientPool, writes to all clients that the nickname of the client who entered the command has changed to <new-nickname>
    client.nickname = data.name; //client who entered commands nickname reassigned value of name property passed from data object
  });

  socket.on('affiliation', function(data) {
    client.affiliation = data.affiliation;
  });

  socket.on('voteThieves', function(data) {
    let targets = clientPool.filter(c => c.affiliation === 'thieves');
    let robbed = clientPool.filter(c => c.nickname = data.votedFor);

    targets.map(c => c.socket.write(`\t${client.nickname} has voted to rob ${data.votedFor}\n`));
    
    robbed[0].vote++;
  });

  socket.on('dm', function(data) {
    let target = clientPool.filter(c => c.nickname === data.name); //creates target var, assigns value of nickname matching the name property of passed data object
    target[0].socket.write(`\n${client.nickname} whispered: ${data.said}\n`); //writes to the targets socket entered message from client who entered command
  });

  //???
  socket.on('dmthieves', function(data) {
    let target = clientPool.filter(c => c.nickname === data.name); //creates target var, assigns value of nickname matching the name property of passed data object
    target[0].socket.write(`\n${client.nickname} whispered: ${data.said}\n`); //writes to the targets socket entered message from client who entered command
  });

  socket.on('message', function(data) { //custom event from cmd.js
    let msg = data.said; //message variable assigned value of said property of data object passed from cmd.js
    clientPool.map(c => c.socket.write(`\t${client.nickname}: ${msg}\n`)); //maps through clientPool and writes message from message sender to each user
  });
});


server.start = () => {
  if (server.isOn) return Error(new Error('Server Error. Server already running.'));
  server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
    server.isOn = true;
    mongoose.connect(MONGODB_URI);
    console.log(`mongoose connection to ${MONGODB_URI} on port ${PORT}`);
  });
};

// server.listen(PORT, () => console.log(`Listening on ${PORT}`)); //turn on server to listen for commands, this line logs to nodemon when running