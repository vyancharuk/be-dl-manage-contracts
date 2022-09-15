const { Router } = require('express');

const balanceController = require('./controllers');
const route = Router();

module.exports = (app) => {
    app.use('/balance', route);


    route.post(
        '/deposit',
        balanceController.depositUserProfile
    );
};
