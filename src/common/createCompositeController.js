const logger = require('./logger');
const { sequelize } = require('../model');

const {
    HTTP_STATUS,
} = require('./types');

const createController = require('./createController');



const { getStatusForError, defaultResponseHandler, isErrorCode } = require('./utils');

// according to clean architecture paramsCb serves as interactor - just pass params to service(use case)
const createCompositeController = (
    controllerConfigs,
    responseHandler = defaultResponseHandler,
    options = {}
) => async (req, res, next) => {
    const start = Date.now();
    // make logs observable using traceId https://medium.com/dzerolabs/unpacking-observability-the-paradigm-shift-from-apm-to-observability-707735953c75
    // traceId can be loaded from req.headers['x-amzn-trace-id'] for easy troubleshooting in cloud
    const traceId = (Date.now() % Math.pow(10, 6));

    logger.info(`[${traceId}]createCompositeController:started:${controllerConfigs.length}`, controllerConfigs[0]);

    let ctrlResults = [];
    let httpHeaders = [];
    let codes = [];
    let serviceKeys = [];

    // callback which called to process result of each nested controller
    const responseCb = (
        res,
        { result, code, headers }
    ) => {
        const serviceKey = controllerConfigs[ctrlResults.length].service.name;

        ctrlResults.push(result);
        codes.push(code);
        serviceKeys.push(serviceKey);

        if (headers) {
            httpHeaders = httpHeaders.concat(headers);
        }
    };

    const logMsg = (msg) => {
        logger.info(msg);
    }

    let transaction;
    let loggerWrapper;
    let results;

    try {
        const ctors = controllerConfigs.map((cf) => {
            return cf.service;
        });

        // create transaction if needed, and share it between all DALs used by controllers' service
        if (options.useTransaction) {
            // create transaction, and share its' instance between all repositories used by controller
            transaction = await sequelize.transaction()
        }

        // pass by default logger
        results = {};

        const controllers = ctors.map((ctor, ind) => {
            return createController(
                ctor,
                // bypass results
                (...args) => controllerConfigs[ind].paramsCb(...[...args, results]),
                responseCb,
                {
                    ...options,
                    parentTraceId: traceId,
                    parentTransaction: transaction
                }
            );
        });

        let counter = 0;
        // start processing nested controllers
        for await (const ctrl of controllers) {
            await ctrl(req, res, next);

            const key = controllerConfigs[counter].service.name;
            // store controller execution result to use it later
            results[key] = ctrlResults[ctrlResults.length - 1];


            logMsg(
                `[${traceId}]createCompositeController:${counter} lastCode=${codes[codes.length - 1]
                }`
            );

            // if (codes.length < counter + 1) {
            //     logMsg(
            //         `[${traceId}]createCompositeController:error:last call didn't return http code`
            //     );

            //     exited = true;
            //     break;
            // }

            if (isErrorCode(codes[codes.length - 1])) {
                logMsg(
                    `[${traceId}]createCompositeController:last:error:code=${codes[codes.length - 1]
                    }:stop:controllers`
                );

                break;
            }

            counter += 1;
        }


        // // check if each nested controller returned code(status) and result

        // rollback or commit transaction depending on operation results
        if (transaction !== undefined && isErrorCode(codes[codes.length - 1])) {
            logMsg(`[${traceId}]createCompositeController:transaction:rollback`);
            await transaction.rollback();
        } else if (transaction !== undefined) {
            await transaction.commit();

            logMsg(`[${traceId}]createCompositeController:after:transaction:commit`);
        }
    } catch (ex) {
        logMsg(
            `[${traceId}]createCompositeController:exception:${ex} \r\n ${(ex).stack}`
        );

        if (transaction !== undefined) {
            logMsg(`[${traceId}]createCompositeController:error:transaction:rollback`);

            await transaction.rollback();
        }

        logMsg(`[${traceId}]createCompositeController:${options.name}:duration:end:${new Date().getTime() - start}ms`);

        return responseHandler(res, {
            result: {
                error: ex.toString(),
            },
            code: getStatusForError(ex),
        });
    }

    if (isErrorCode(codes[codes.length - 1])) {
        logMsg(`[${traceId}]createCompositeController:isErrorCode=`, true, 'codes=', codes);

        return responseHandler(res, {
            result: {
                ...ctrlResults[ctrlResults.length - 1],
                service: serviceKeys[serviceKeys.length - 1],
            },
            code: codes[codes.length - 1],
            headers: httpHeaders,
        });
    }

    if (codes.length > 0) {
        const result = ctrlResults.reduce(
            (agg, result, ind) => ({
                ...agg,
                [controllerConfigs[ind].service.name]: {
                    result,
                    status: codes[ind],
                },
            }),
            { logger: loggerWrapper }
        );


        return responseHandler(res, {
            result,
            code: codes[codes.length - 1],
            headers: httpHeaders,
        });
    }

    return responseHandler(res, {
        result: {
            error: 'NO_STATUS_RETURNED',
        },
        code: HTTP_STATUS.BAD_REQUEST,
    });
};

module.exports = createCompositeController;
