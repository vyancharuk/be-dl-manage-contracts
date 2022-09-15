const createController = require('../../common/createController');
const { HTTP_STATUS } = require('../../common/types');

const GetBestProfession = require('./getBestProfession.service');
const GetBestClients = require('./getBestClients.service')

module.exports = {
    getBestProfession: createController(GetBestProfession,
        (req) => ({
            profileId: req.get('profile_id'),
            start: req.query.start,
            end: req.query.end,
        }), (res, { result, code }) => {
            if (!result) {
                return res.status(HTTP_STATUS.NOT_FOUND).end();
            };

            res.status(code).json(result).end();
        },
    ),

    getBestClients: createController(GetBestClients,
        (req) => ({
            profileId: req.get('profile_id'),
            start: req.query.start,
            end: req.query.end,
            limit: req.query.limit,
        }), (res, { result, code }) => {
            res.status(code).json(result).end();
        },
    ),
};
