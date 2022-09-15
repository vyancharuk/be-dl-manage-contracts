const supertest = require('supertest');

const initExpressApp = require('../../../app');
const { HTTP_STATUS } = require('../../../common/types');
const { addHeaders } = require('../../../tests/utils');

const PROFILE_ID = 8;
const ADMIN_PROFILE_ID = 9;

describe('ADMIN API', () => {
    const request = supertest(initExpressApp());

    it('Should successfully load best PROFESSION for ADMIN', async () => {
        let response = await addHeaders(request.get(`/admin/best-profession`), ADMIN_PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body).toEqual(expect.anything());
        expect(response.body.bestProfession).toEqual('Programmer');
    });

    it('Should successfully load best PROFESSION with date filter for ADMIN', async () => {
        let response = await addHeaders(request.get(`/admin/best-profession`)
            .query({ end: '2020-08-11' }), ADMIN_PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body).toEqual(expect.anything());
        expect(response.body.bestProfession).toEqual('Musician');
    });

    it('Should NOT load best profession for REGULAR user', async () => {
        let response = await addHeaders(request.get(`/admin/best-profession`), PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it('Should successfully load best CLIENTS for ADMIN', async () => {
        const limit = 3;
        let response = await addHeaders(request.get(`/admin/best-clients`)
            .query({
                limit,
                start: '2020-08-09',
                end: '2020-09-15'
            }), ADMIN_PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body).toEqual(expect.anything());
        expect(response.body.length).toEqual(limit);

        // check top first customer
        expect(response.body[0].firstName).toEqual('Ash');
        expect(response.body[0].lastName).toEqual('Kethcum');

        expect(response.body[0].amount).toBeGreaterThan(2000);
    });

    it('Should successfully load best 2 CLIENTS for ADMIN with default limit', async () => {
        let response = await addHeaders(request.get(`/admin/best-clients`)
            .query({
                start: '2020-08-09',
                end: '2020-09-15'
            }), ADMIN_PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body).toEqual(expect.anything());
        expect(response.body.length).toEqual(2);
    });
});
