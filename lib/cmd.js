'use strict';

module.exports = (data, connected) => { //data parameter represents data passed to/from server, connected represents clientpool
  let message = data.toString().trim().split(' ');
  if(message[0][0] === '@') { //command character verification
    switch(message[0]) { //if command exists (even if just '@')
    case '@quit':
      return {command: 'close'}; //return command to close connection of client entering command

    case '@list':
      return {command: 'list'}; //return ommand to list all connected clients

    case '@nickname':
      return message[2] ? {command: 'error', err: '@nickname requires a name without spaces'} : {command: 'nickname', name: message[1]}; 

    case '@affiliation':
      return message[2] ? {command: 'error', err: '@affiliation should be followed by a one-word entry'} : {command: 'affiliation', affiliation: message[1]}; 

    case '@voteThieves':
      return message[2] ? {command: 'error', err: '@voteThieves should be followed by the nickname being voted for only'} : {command: 'voteThieves', votedFor: message[1]}; 

    case '@dm':
      if(connected.filter(c => c.nickname === message[1]).length) return {command: 'dm', name: message[1], said: message.slice(2).join(' ')}; //if client pool filtered by nickname entered following @dm command exists, return command dm with name of recipient user, and only contents of 3rd index on will be joined and send as 'said'
      return {command: 'error', err: 'User does not exist, cannot direct message'};

    case '@dmthieves':
      if(connected.filter(c => c.affiliation === 'thieves').length) return {command: 'dmtheives', name: message[1], said: message.slice(2).join(' ')};
      return {command: 'error', err: 'User does not exist, cannot direct message'};

    default:
      return {command: 'error', err: 'Command does not exist'};
    }
  } else return {command: 'message', said: message.join(' ')}; //if not special command character, rejoin message and return as normal chat message
};