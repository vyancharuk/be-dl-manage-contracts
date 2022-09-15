const winston = require('winston');

const LOG_LEVEL = 'info';

// TODO: configure properly logger
const transports = [];

const customFormat = winston.format.printf(
    ({ level, message, label, timestamp }) => {
        // return `${timestamp} [${label}] ${level}: ${message}`;
        return `${timestamp} ${level}: ${message}`;
    }
);

transports.push(
    new winston.transports.Console({
        level: 'info',
        handleExceptions: true,
        format: winston.format.combine(
            // winston.format.label({ label: 'dev' }),
            winston.format.colorize(),
            winston.format.timestamp({ format: 'MM/DD HH:mm:ss:SSS' }),
            customFormat
        ),
    })
);


const loggerInstance = winston.createLogger({
    level: LOG_LEVEL,
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports,
});

module.exports = loggerInstance;
