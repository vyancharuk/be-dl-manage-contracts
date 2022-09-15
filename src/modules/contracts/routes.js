const { Router } = require('express');

const contractsController = require('./controllers');


const route = Router();

module.exports = (app) => {
    app.use('/contracts', route);

    route.get(
        '/',
        contractsController.getProfileContracts
    );

    route.get(
        '/:id',
        contractsController.getContractById
    );
};
