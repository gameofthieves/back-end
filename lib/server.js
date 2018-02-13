'use strict';

// Application Dependencies
const net = require('net');
const User = require('../model/user');
const command = require('../lib/commands');

// Application Setup
const server = module.exports = net.createServer();
const PORT = process.env.PORT;
let userPool = [];

server.on('connection', function(socket) {
    let user = new User(socket);
    userPool.push(user);
    userPool.map(usr => usr.socket.write(`\t${user.nick} has joined the game\n`));

    socket.on('data', function(data) {
        command.parse(data, socket, user, userPool);
    });

    socket.on('close', function() {
        userPool = userPool.filter(usr => usr.user !== user.user);
        userPool.map(usr => usr.socket.write(`\t${user.nick} has left the game\n`));
    });

    socket.on('error', function(error) {
        console.error(error);
    });
});

server.start = () => {
    if(server.isOn) return Error(new Error('Server Error. Server already running.'));
    server.listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
        server.isOn = true;
    });
};

