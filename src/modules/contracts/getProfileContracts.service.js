const Joi = require('joi');

const BaseService = require('../../common/baseService');
const ContractsDal = require('./dal');

class GetProfileContracts extends BaseService {
    static validationRules = {
        profileId: Joi.number().min(1),
    };

    contractDal = new ContractsDal();

    async execute(validatedUserData) {
        const {
            profile,
            profileId,
        } = validatedUserData;

        this.logInfo('GetProfileContracts:profileId', profileId, 'profile=', profile);

        const contracts = await this.contractDal.findAllByStatus(profileId, ['new', 'in_progress']);

        return contracts;
    }
}

module.exports = GetProfileContracts;
