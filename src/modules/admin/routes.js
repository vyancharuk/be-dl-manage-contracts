const { Router } = require('express');

const adminController = require('./controllers');


const route = Router();

module.exports = (app) => {
    app.use('/admin', route);


    route.get(
        '/best-profession',
        adminController.getBestProfession
    );

    route.get(
        '/best-clients',
        adminController.getBestClients
    );
};
