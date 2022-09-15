const supertest = require('supertest');

const initExpressApp = require('../../../app');
const { HTTP_STATUS } = require('../../../common/types');
const { addHeaders } = require('../../../tests/utils');

const PROFILE_ID = 1;
const CONTRACT_ID = 2;

describe('Contracts API', () => {
    const request = supertest(initExpressApp());

    it('Should correctly load Contract by id', async () => {
        const response = await addHeaders(request.get(`/contracts/${CONTRACT_ID}`), PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);

        expect(response.body).toEqual(expect.anything());
        expect(response.body.id).toBe(CONTRACT_ID);
    });

    it('Should return proper status for non-existing contract', async () => {
        const response = await addHeaders(request.get(`/contracts/10001`), PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    });

    it('Should correctly load all non terminated contracts', async () => {
        const response = await addHeaders(request.get('/contracts'), PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);

        expect(response.body).toEqual(expect.anything());
        expect(response.body.length).toBe(1);

        const terminated = response.body.filter(c => c.status === 'terminated');

        expect(terminated.length).toBe(0);
    });
});
