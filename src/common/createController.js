const process = require('process');
const logger = require('./logger');
const { sequelize } = require('../model');

const {
    HTTP_STATUS,
} = require('./types');

const { getStatusForError } = require('./utils');

// according to clean architecture paramsCb serves as interactor - just pass params to service(use case)
const createController = (
    serviceConstructor,
    paramsCb,
    resCb,
    options = {},
) => async (req, res) => {
    // make logs observable using traceId https://medium.com/dzerolabs/unpacking-observability-the-paradigm-shift-from-apm-to-observability-707735953c75
    // traceId can be loaded from req.headers['x-amzn-trace-id'] for easy troubleshooting in cloud
    const traceId = !options.parentTraceId ? (Date.now() % Math.pow(10, 6)) : options.parentTraceId;

    logger.info(`[${traceId}]createController:start:pid=${process.pid}`);

    let transaction = options.parentTransaction;

    try {
        logger.info(`[${traceId}]createController:create:instance`);

        const service = new serviceConstructor();
        const dals = service.getDals();

        if (options.useTransaction && !options.parentTransaction) {
            // create transaction, and share its' instance between all repositories used by controller
            transaction = await sequelize.transaction()

            logger.info(`[${traceId}]createController:use:transaction=${!!transaction}`);

            // according to pattern "unit of work" perform all operation changes in transaction if needed
            // https://www.martinfowler.com/eaaCatalog/unitOfWork.html
            dals.forEach((dal) => dal.setTransaction(transaction));
        }

        dals.forEach((dal) => dal.setLogPrefix(traceId.toString()));
        service.setLogPrefix(traceId.toString());

        const params = paramsCb(req, res);
        const result = await service.run(params);

        if (transaction !== undefined && !options.parentTransaction) {
            logger.info(`[${traceId}]createController:transaction:commit`);

            await transaction.commit();
        }

        logger.info(`[${traceId}]createController:completed`);

        if (!resCb) {
            return res.json({ result }).status(HTTP_STATUS.OK);
        }

        return resCb(res, { result, code: HTTP_STATUS.OK }, req);
    } catch (ex) {
        logger.error(`[${traceId}]createController:error=${ex} \r\n ${ex.stack}`);

        if (transaction !== undefined && !options.parentTransaction) {
            logger.warn(`[${traceId}]createController:transaction:rollback`);

            await transaction.rollback();
        }

        // handle CustomError
        if (ex.toJSON) {
            logger.error(`[${traceId}]createController:error:handleCustom`);

            return resCb(res, {
                result: ex.toJSON(),
                code: ex.status || getStatusForError(ex),
            });
        }

        return resCb(res, {
            result: { error: ex.toString() },
            code: getStatusForError(ex),
        });
    }
};

module.exports = createController;
