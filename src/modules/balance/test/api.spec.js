const supertest = require('supertest');

const initExpressApp = require('../../../app');
const { HTTP_STATUS } = require('../../../common/types');
const { addHeaders } = require('../../../tests/utils');

const PROFILE_ID = 2;

describe('Balance API', () => {
    const request = supertest(initExpressApp());

    it('Should successfully deposit balance', async () => {
        let response = await addHeaders(request.post(`/balance/deposit`).send({
            amount: 10,
        }), PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body).toEqual(expect.anything());
    });

    it('Should fail to deposit balance with BIG amount', async () => {
        let response = await addHeaders(request.post(`/balance/deposit`).send({
            amount: 1000,
        }), PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);

        expect(response.body).toEqual(expect.anything());
        expect(response.body.error).toEqual('AMOUNT_IS_TOO_BIG');
    });
});
