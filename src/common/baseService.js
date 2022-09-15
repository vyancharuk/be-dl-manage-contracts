const Joi = require('Joi');

const { CustomError } = require('./types');
const BaseDal = require('./baseDal');
const logger = require('./logger');

const ProfilesDal = require('../modules/profiles/dal');


class BaseService {
    _logPrefix = '';

    constructor() {
        this.profilesDal = new ProfilesDal();
    }

    setLogPrefix(logPrefix) {
        this._logPrefix = logPrefix;
    }

    // get all DALs instances used by current instance
    getDals() {
        const dals = [];

        Object.getOwnPropertyNames(this).forEach((prop) => {
            if (this[prop] instanceof BaseDal) {
                dals.push(this[prop]);
            }
        });

        return dals;
    }

    validate(params) {
        // read static property value
        const schema = Joi.object(this.constructor['validationRules'] || {});
        // TODO: include by default validation for userId for all not public routes
        // include userData loaded from redis or db
        return schema.validate(params);
    }

    // empty base implementation
    async execute(params) { }

    async run(params) {
        const { value: validated, error } = this.validate(params);

        if (error) {
            throw new Error(error);
        }

        const { profileId } = validated || {};
        let profile = null;

        if (profileId) {
            profile = await this.profilesDal.findById(profileId);

            if (!profile) {
                throw new CustomError(401, 'INVALID_PROFILE_ID_PASSED');
            }
        } else {
            throw new CustomError(401, 'PROFILE_ID_IS_MISSED');
        }

        return this.execute({ ...validated, profile });
    }

    logInfo(...args) {
        const msg = args
            .map((arg) => {
                if (arg && Array.isArray(arg)) {
                    return JSON.stringify(arg, null, 4);
                } else if (arg && typeof arg === 'object') {
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

module.exports = BaseService;
