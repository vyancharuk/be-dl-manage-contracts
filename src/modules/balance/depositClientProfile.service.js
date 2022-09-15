const Joi = require('joi');

const BaseService = require('../../common/baseService');

const JobsDal = require('../jobs/dal');
const ContractsDal = require('../contracts/dal');
const { CustomError, HTTP_STATUS } = require('../../common/types');

class DepositClientsProfile extends BaseService {
    static validationRules = {
        profileId: Joi.number().min(1),
        amount: Joi.number().min(1).required(),
        jobs: Joi.array().items(Joi.object({
            id: Joi.number().min(1),
            price: Joi.number().min(1),
        })).required(),
    };

    jobsDal = new JobsDal();
    contractDal = new ContractsDal();

    async execute(validatedUserData) {
        const {
            profile,
            profileId,
            amount,
            jobs,
        } = validatedUserData;

        this.logInfo('DepositClientsProfile:profileId', profileId, 'amount=', amount,
            'jobs=', jobs,
            'profile', profile);

        // const jobs = await this.jobsDal.findAllForUser(profileId);


        const totalAmount = jobs.reduce((sum, j) => sum + j.price, 0);
        this.logInfo('DepositClientsProfile:profileId:totalAmount=', totalAmount);

        if (amount > totalAmount * 0.25) {
            throw new CustomError(HTTP_STATUS.BAD_REQUEST, 'AMOUNT_IS_TOO_BIG');
        }

        await this.profilesDal.updateBalance(profileId, profile.balance + amount);

        return { deposited: true }
    }
}

module.exports = DepositClientsProfile;
