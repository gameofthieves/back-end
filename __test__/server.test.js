'use strict';

const net = require('net');
const User = require('../model/user');
const command = require('../lib/commands');
const server = module.exports = net.createServer();
const PORT = process.env.PORT;

describe('valid requests', () => {
    it('should listen on port 4000', () => {
        server.listen(PORT, () => console.log(`Listening on ${PORT}`));
        expect(PORT).toEqual('4000');
    });
});