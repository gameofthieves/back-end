'use strict';

const User = require('../../model/user.js');
const net = require('net');

describe('user model', () => {
  let testClient = net.connect({port: 3000});
  describe('valid user instances', () => {
    it('should input valid socket into the user model', () => {
      let testUser = new User(testClient);
      expect(testUser.socket).toEqual(testClient);
      testClient.end();
    });
  });
});
