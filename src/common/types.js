const HTTP_STATUS = require('http-status');
// const Joi = require('joi');

class CustomError extends Error {
    status;
    toJSON = () => { };

    constructor(status, name, message = '') {
        super();
        this.name = name;
        this.message = message;
        this.status = status;

        this.toJSON = () => {
            return {
                error: this.name,
                code: this.status,
                message: this.message,
            };
        };
    }
}

module.exports = {
    HTTP_STATUS,
    // Joi,
    CustomError
}