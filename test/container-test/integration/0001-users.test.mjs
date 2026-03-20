import {
  describe,
  expect,
  test,
} from 'vitest';

// import db from '../lib/db';
import { noAuthAPI } from '../lib/api';

describe('0001 Users Group', () => {
  describe.skip('POST /users/login', async () => {
    describe('Request Failure', () => {
      test('Absent required email returns 400', async () => {
        const reqBody = {
          password: 'jars@semios.com',
        };

        const res = await noAuthAPI.post('/users/login', reqBody);

        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'email'`);
      });

      test('Absent required password returns 400', async () => {
        const reqBody = {
          email: 'jars-admin@semios.com',
        };

        const res = await noAuthAPI.post('/users/login', reqBody);

        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'password'`);
      });

      test('Invalid type email returns 400', async () => {
        const reqBody = {
          email: 1234,
          password: 'jars@semios.com',
        };

        const res = await noAuthAPI.post('/users/login', reqBody);

        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toBe(`body/email must be string`);
      });

      test('Invalid type password returns 400', async () => {
        const reqBody = {
          email: 'jars-admin@semios.com',
          password: 1234,
        };

        const res = await noAuthAPI.post('/users/login', reqBody);

        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toBe(`body/password must be string`);
      });
    });

    describe('Response Success', async () => {
      const reqBody = {
        email: 'jars-admin@semios.com',
        password: 'jars@semios.com',
      };

      const res = await noAuthAPI.post('/users/login', reqBody);

      const { body: resBody } = res;

      test('Success response returns 200', () => {
        expect(res.statusCode).toBe(200);
      });

      test('Response schema matches the expected structure', () => {
        const responseData = resBody;

        expect(responseData).toBeTypeOf('object');
        expect(responseData).toHaveProperty('id');
        expect(responseData).toHaveProperty('email');
        expect(responseData).toHaveProperty('first_name');
        expect(responseData).toHaveProperty('last_name');
        expect(responseData).toHaveProperty('company');
        expect(responseData).toHaveProperty('position');
        expect(responseData).toHaveProperty('country');
        expect(responseData).toHaveProperty('state');
        expect(responseData).toHaveProperty('city');
        expect(responseData).toHaveProperty('main_phone');
        expect(responseData).toHaveProperty('secondary_phone');
        expect(responseData).toHaveProperty('address');
        expect(responseData).toHaveProperty('zip_code');
        expect(responseData).toHaveProperty('customer_id');
        expect(responseData).toHaveProperty('locale');
        expect(responseData).toHaveProperty('permissions');
        expect(responseData).toHaveProperty('authentication_details');
        expect(responseData).toHaveProperty('customers');
        expect(responseData).toHaveProperty('token');

        expect(responseData.locale).toBeTypeOf('object');
        expect(responseData).toHaveProperty('locale.tempConv');

        expect(responseData.permissions).toBeTypeOf('object');
        expect(responseData).toHaveProperty('permissions.level');

        expect(responseData.customers).toBeTypeOf('object');
        responseData.customers.forEach((customer) => {
          expect(customer).toBeTypeOf('object');
          expect(customer).toHaveProperty('id');
          expect(customer).toHaveProperty('created_at');
          expect(customer).toHaveProperty('customer_name');
          expect(customer).toHaveProperty('brand_name');
          expect(customer).toHaveProperty('updated_at');
          expect(customer).toHaveProperty('is_distributor');
          expect(customer).toHaveProperty('groups_enabled');
          expect(customer).toHaveProperty('is_active');
          expect(customer).toHaveProperty('required_action_3g_lte_transition');
          expect(customer).toHaveProperty('security');

          expect(customer).toHaveProperty('user_customer');
          expect(customer.user_customer).toBeTypeOf('object');
          expect(customer.user_customer).toHaveProperty('customer_id');
          expect(customer.user_customer).toHaveProperty('user_id');

          expect(customer.user_customer).toHaveProperty('permissions');
          expect(customer.user_customer.permissions).toBeTypeOf('object');
          expect(customer.user_customer.permissions).toHaveProperty('level');

          expect(customer).toHaveProperty('brand');
          expect(customer.brand).toBeTypeOf('object');
          expect(customer.brand).toHaveProperty('name');
          expect(customer.brand).toHaveProperty('display_name');
          expect(customer.brand).toHaveProperty('css');
          expect(customer.brand).toHaveProperty('sales_email');
          expect(customer.brand).toHaveProperty('sales_phone');
          expect(customer.brand).toHaveProperty('support_email');
          expect(customer.brand).toHaveProperty('support_phone');
          expect(customer.brand).toHaveProperty('splash_img');
          expect(customer.brand).toHaveProperty('icon_png');
          expect(customer.brand).toHaveProperty('icon_svg');
          expect(customer.brand).toHaveProperty('banner_svg');
          expect(customer.brand).toHaveProperty('created_at');
          expect(customer.brand).toHaveProperty('updated_at');

          expect(customer.brand).toHaveProperty('locale');
          expect(customer.brand.locale).toBeTypeOf('object');
          expect(customer.brand.locale).toHaveProperty('language');
          expect(customer.brand.locale).toHaveProperty('timeZone');
          expect(customer.brand.locale).toHaveProperty('tempConv');
        });

        expect(responseData).toHaveProperty('groups');
        expect(responseData.groups).toBeTypeOf('object');
        responseData.groups.forEach((group) => {
          expect(group).toBeTypeOf('object');
          expect(group).toHaveProperty('id');
          expect(group).toHaveProperty('customer_id');
          expect(group).toHaveProperty('device_group');
          expect(group).toHaveProperty('icon');
          expect(group).toHaveProperty('name');
          expect(group).toHaveProperty('is_active');
          expect(group).toHaveProperty('created_at');
          expect(group).toHaveProperty('updated_at');
        });
      });

      test('Email is in a valid format', function () {
        const responseData = resBody;

        expect(responseData).toBeTypeOf('object');
        expect(responseData.email).toBeDefined();
        expect(responseData.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format is invalid');
      });
    });
  });

  describe.skip('POST /users/passwordRecovery', async () => {});

  describe.skip('PUT /users/passwordReset', async () => {});

  describe.skip('GET /users', async () => {});

  describe.skip('GET /users/:userID', async () => {});

  describe.skip('GET /users/exists', async () => {});

  describe.skip('POST /users/new', async () => {});

  describe.skip('POST /users', async () => {});

  describe.skip('PUT /users/:userID', async () => {});

  describe.skip('POST /users/invite', async () => {});

  describe.skip('GET /users/email/:email', async () => {});

  describe.skip('GET /users/authID/:authID?', async () => {});

  describe.skip('POST /users/pin', async () => {});

  describe.skip('POST /users/pin/change', async () => {});

  describe.skip('POST /users/customer/change', async () => {});
});
