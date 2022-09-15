const createCompositeController = require('../../common/createCompositeController');


const DepositClientProfile = require('./depositClientProfile.service');
const GetUnpaidJobs = require('../jobs/getUnpaidJobs.service');
const { isErrorCode } = require('../../common/utils');

module.exports = {
    depositUserProfile: createCompositeController([
        {
            service: GetUnpaidJobs,
            paramsCb: (req) => ({
                profileId: req.get('profile_id'),
            })
        },
        {
            service: DepositClientProfile,
            paramsCb: (req, res, results) => {
                const unpaidJobs = results['GetUnpaidJobs'].map(j => ({ id: j.id, price: j.price }));

                return {
                    profileId: req.get('profile_id'),
                    amount: req.body.amount,
                    jobs: unpaidJobs,
                }
            }
        }],
        (res, { result, code }) => {
            if (isErrorCode(code)) {
                return res.status(code).json(result).end();
            }

            const depositResult = result['DepositClientsProfile'] ?
                result['DepositClientsProfile'].result
                :
                null;

            res.status(code).json(depositResult).end();
        },
        {
            useTransaction: true
        }
    ),
};
