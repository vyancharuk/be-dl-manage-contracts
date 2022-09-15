const createController = require('../../common/createController');
const { HTTP_STATUS } = require('../../common/types');

const GetContractById = require('./getContractById.service');
const GetProfileContracts = require('./getProfileContracts.service.js')

module.exports = {
    getContractById: createController(GetContractById,
        (req) => ({
            contractId: req.params.id,
            profileId: req.get('profile_id'),
        }), (res, { result, code }) => {
            if (!result) {
                return res.status(HTTP_STATUS.NOT_FOUND).end();
            };

            res.status(code).json(result).end();
        },
    ),

    getProfileContracts: createController(GetProfileContracts,
        (req) => ({
            profileId: req.get('profile_id'),
        }), (res, { result, code }) => {
            res.status(code).json(result).end();
        },
    ),
};
