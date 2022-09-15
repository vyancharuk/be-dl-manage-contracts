const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;
const process = require('process');

const logger = require('./common/logger');

const initExpressApp = require('./app');

async function init() {
  logger.info(`Worker ${process.pid} started`);

  try {
    const app = initExpressApp();

    app.listen(3001, () => {
      logger.info(`express:with pid=${process.pid}:listening on port 3001`);
    });
  } catch (error) {
    logger.error(`error:occurred:${JSON.stringify(error)}`);
    process.exit(1);
  }
}

if (cluster.isMaster) {
  logger.info(`number:CPUs=${totalCPUs}`);
  logger.info(`master:pid=${process.pid}:running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.info(`worker:pid=${worker.process.pid}:died`);
    logger.info('fork:worker');
    cluster.fork();
  });

} else {
  // start each worker handlers
  init();
}


