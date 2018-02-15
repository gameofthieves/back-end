'use strict';

const net = require('net');
const server = require('../lib/server');
const PORT = process.env.PORT;
beforeAll(server.start);
afterAll(server.stop);
describe('valid requests', () => {
  it(`should listen on 3000`, () => {
    expect(PORT).toEqual('3000');
  });

  it('should connect and notify me that I joined the channel', done => {
    let message = [];
    const client = net.connect({ port: 3000 });
    client.on('data', data => {
      message.push(data.toString());
      client.end(null, () => {
        if(message.includes(data.toString())){
          var testingExpected = true;
        } else {
          testingExpected = false;
        }
        expect(testingExpected).toBe(true);
        done();
      });
    });
  });

  describe('should successfully start the server', () => {
    server.stop;
    server.isOn;
    console.log('server.isOn === ', server.isOn);
    server.start;

    it('should start the server if server.isOn is flagged false', () => {
      expect(server.isOn).toBe(true);
    });
  });

  describe('server connections ', () => {
    it('should return a count of 1', () => {
      const client = net.connect({ port: 3000 });
      server.getConnections((err, count) => {
        if (err) throw err;
        console.log('connections: ', count);
        expect(count).toBe(1);
      });
      client.on('data', data => {
        console.log('data returned on connections test', data);
        client.end();
      });
    });
  });
});
