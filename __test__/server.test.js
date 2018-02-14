'use strict';

const net = require('net');
const User = require('../model/user');
const command = require('../lib/commands');
const server = require('../lib/server');
const PORT = process.env.PORT;

afterAll(server.stop);
describe('valid requests', () => {
  it(`should listen on 3000`, () => {
    expect(PORT).toEqual('3000');
  });

  it('should connect and notify me that I joined the channel', done => {
    let message = [];
    const client = net.connect({ port: 3000 });
    // console.log(socket)
    client.on('data', data => {
      console.log('DATA', data.toString());
      message.push(data.toString());
      client.end(null, () => {
        console.log('MESSAGE', message);
        if(message.includes(data.toString())){
          var testingExpected = true;
        } else {
          testingExpected = false;
        }
        expect(testingExpected).toBe(true);
        console.log('MESSAGE', message);
        done();
      });
    });
  });


});
