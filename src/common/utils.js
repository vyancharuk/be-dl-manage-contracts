const { HTTP_STATUS } = require('./types');

const defaultResponseHandler = (
    res,
    { result, code, headers = [] }
) => {
    headers.forEach(({ name, value }) => {
        res.set(name, value);
    });

    return res.status(code).json({ result });
};

const getStatusForError = (error) => {
    if (error.toString().toLowerCase().indexOf('validationerror') > -1) {
        return HTTP_STATUS.BAD_REQUEST;
    }

    return HTTP_STATUS.INTERNAL_SERVER_ERROR;
};

const isErrorCode = (code) => {
    return !code.toString().startsWith('2');
};


module.exports = { defaultResponseHandler, getStatusForError, isErrorCode };
