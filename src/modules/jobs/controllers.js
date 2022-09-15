const createController = require('../../common/createController');

const GetUnpaidJobs = require('./getUnpaidJobs.service');
const PayJob = require('./payJob.service');

module.exports = {
    getUnpaidJobs: createController(GetUnpaidJobs,
        (req) => ({
            profileId: req.get('profile_id'),
        }), (res, { result, code }) => {
            res.json(result).status(code)
        },
    ),
    payJob: createController(PayJob,
        (req) => ({
            profileId: req.get('profile_id'),
            jobId: req.params.id,
        }), (res, { result, code }) => {
            res.status(code).json(result).end();
        },
        {
            useTransaction: true
        }
    ),
};
