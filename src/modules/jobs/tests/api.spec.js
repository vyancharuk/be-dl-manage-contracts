const supertest = require('supertest');

const initExpressApp = require('../../../app');
const { HTTP_STATUS } = require('../../../common/types');
const { addHeaders } = require('../../../tests/utils');

const PROFILE_ID = 2;


describe('Jobs API', () => {
    const request = supertest(initExpressApp());

    it('Should correctly load unpaid jobs ', async () => {
        const response = await addHeaders(request.get(`/jobs/unpaid`), PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);

        expect(response.body).toEqual(expect.anything());
        expect(response.body.length).toBe(2);

        const paidJobs = response.body.filter(j => j.paid || j.paymentDate);

        expect(paidJobs.length).toBe(0);
    });


    it('Should correctly pay for unpaid jobs', async () => {
        const unpaidJobsInitCount = 2;

        let response = await addHeaders(request.get(`/jobs/unpaid`), PROFILE_ID);
        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(response.body.length).toBe(unpaidJobsInitCount);

        let unpaidJobId = response.body[0].id;

        response = await addHeaders(request.post(`/jobs/${unpaidJobId}/pay`), PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);

        expect(response.body).toEqual(expect.anything());


        response = await addHeaders(request.get(`/jobs/unpaid`), PROFILE_ID);

        expect(response.status).toBe(HTTP_STATUS.OK);

        // check that 
        expect(response.body.length).toBe(unpaidJobsInitCount - 1);


    });
});
