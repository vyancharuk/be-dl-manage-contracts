const { Router } = require('express');

const jobsController = require('./controllers');


const route = Router();

module.exports = (app) => {
    app.use('/jobs', route);

    route.get(
        '/unpaid',
        jobsController.getUnpaidJobs
    );

    route.post(
        '/:id/pay',
        jobsController.payJob
    );
};
