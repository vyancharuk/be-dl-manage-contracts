const logger = require('./logger');

class BaseDal {
    transaction = null;
    _logPrefix = '';

    setTransaction(_transaction) {
        this.transaction = _transaction;
    }

    setLogPrefix(logPrefix) {
        this._logPrefix = logPrefix;
    }

    getOptions() {
        if (this.transaction) {
            return {
                transaction: this.transaction,
            }
        }
    }
    logInfo(...args) {
        const msg = args
            .map((arg) => {
                if (arg && typeof arg === 'object') {
                    return JSON.stringify(arg, null, 4);
                } else {
                    return arg;
                }
            })
            .join(' ');

        const message = `[${this._logPrefix}]${msg}`;

        logger.info(message);
    }
}

module.exports = BaseDal;
