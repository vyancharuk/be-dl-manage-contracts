const { Router } = require('express');

const contractsRoutes = require('./contracts/routes');
const jobsRoutes = require('./jobs/routes');
const balanceRoutes = require('./balance/routes');
const adminRoutes = require('./admin/routes');

// guaranteed to get dependencies
module.exports = () => {
  const app = Router();

  jobsRoutes(app);
  contractsRoutes(app);
  balanceRoutes(app);
  adminRoutes(app);

  return app;
};
