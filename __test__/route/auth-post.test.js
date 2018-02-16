'use strict';

require('jest');
const superagent = require('superagent');
const faker = require('faker');
const server = require('../../lib/http');
const mocks = require('../lib/mock');
const basePath = `:${process.env.HTTP_PORT}/api/v1`;

describe('POST api/v1/register', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterAll(mocks.auth.removeAll);

  it('should return status 201 for successful sign up', () => {
    this.mockUser = {
      username: faker.internet.userName(),
      password: faker.internet.password(),
    };
    return superagent.post(`${basePath}/register`)
      .send(this.mockUser)
      .then(res => expect(res.status).toBe(201));
  });

  it('should return status 401 for invalid post request', () => {
    return superagent.post(`${basePath}/register`)
      .catch(err => {
        expect(err.status).toBe(401);
      });
  });

  it('should return status 404 for invalid path', () => {
    return superagent.post(`${basePath}/cats`)
      .catch(err => expect(err.status).toBe(404));
  });
});