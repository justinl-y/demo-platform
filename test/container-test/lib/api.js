const request = require('supertest');

const { BASE_REQUEST } = require('./constants');

const app = request(BASE_REQUEST);

const userLogin = async () => {
  const result = await app
    .post('/users/login')
    .send({
      email: 'jars-super@semios.com',
      password: 'jars@semios.com',
    })
    .set('Accept', 'application/json')
  ;

  return result.body.token;
};

const bearerToken = await userLogin();

const methods = ['get', 'put', 'patch', 'del', 'post'];
const authAPI = {};
const noAuthAPI = {};

// loop over all the http methods (get, post, put, delete and patch) and return functions for each.
// also do error checking for 500s and immediately terminate test suite.
methods.forEach((method) => {
  // Return a pre-configured Supertest request with authorization headers
  authAPI[method] = async (resource, data = {}, headers = {}) => {
    const res = await app[method === 'del' ? 'delete' : method](resource)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send(data)
      .set(headers)
      .set('Accept', 'application/json');

    if (res.status === 500) {
      console.log('SERVER RESPONDED WITH a 500 Status. You should investigate this. Abandoning Tests.');
      console.log(JSON.stringify(res.body));
      process.exit(1);
    }
    else {
      return res;
    }
  };
  noAuthAPI[method] = async (resource, data = {}, headers = {}) => {
    const res = await app[method === 'del' ? 'delete' : method](resource)
      .send(data)
      .set(headers)
      .set('Accept', 'application/json');

    if (res.status === 500) {
      console.log('SERVER RESPONDED WITH a 500 Status. You should investigate this. Abandoning Tests.');
      console.log(JSON.stringify(res.body));
      process.exit(1);
    }
    else {
      return res;
    }
  };
});

module.exports = {
  authAPI,
  noAuthAPI,
};
