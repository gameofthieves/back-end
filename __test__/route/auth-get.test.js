'use strict';

require('jest');
const superagent = require('superagent');
const Auth = require('../../model/auth');
const server = require('../../lib/http');
const basePath = `:${process.env.HTTP_PORT}/api/v1`;

describe('GET api/v1/login', () => {
  beforeAll(() => server.start(process.env.HTTP_PORT, () => console.log(`Listening on ${process.env.HTTP_PORT}`)));

  beforeAll(() => {
    return superagent.post(`${basePath}/register`)
      .send(new Auth({
        username: 'testjoy',
        password: 'testcats',
      }))
      .then(res => res);
  });
    
  afterAll(() => server.stop());
  afterAll(() => Promise.all([Auth.remove()]));

  it('should return status 200 for a valid request', () => {
    return superagent.get(`${basePath}/login`)
      .auth('testjoy', 'testcats')
      .then(res => expect(res.status).toBe(200));
  });


  it('should return status 401 for invalid request', () => {
    return superagent.get(`${basePath}/login`)
      .auth('hello', 'world')
      .catch(err => expect(err.status).toBe(401));
  });

  it('should return status 404 for request to invalid path', () => {
    return superagent.get(`${basePath}/cats`)
      .auth('testjoy', 'testcats')
      .catch(err => expect(err.status).toBe(404));
  });
});