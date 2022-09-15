const Joi = require('joi');

const BaseService = require('../../common/baseService');
const JobsDal = require('./dal');
const ContractsDal = require('../contracts/dal');

class GetUnpaidJobs extends BaseService {
    static validationRules = {
        profileId: Joi.number().min(1),
    };

    jobsDal = new JobsDal();
    contractDal = new ContractsDal();

    async execute(validatedUserData) {
        const {
            profileId,
        } = validatedUserData;

        this.logInfo('GetUnpaidJobs:profileId', profileId);

        const activeContracts = await this.contractDal.findAllByStatus(profileId, 'in_progress');

        this.logInfo('GetUnpaidJobs:activeContracts', activeContracts.length, activeContracts[0]);

        const contractIds = activeContracts.map(ac => ac.id);

        this.logInfo('GetUnpaidJobs:contractIds=', contractIds);

        const jobs = await this.jobsDal.findAllUnpaid(contractIds);

        return jobs;
    }
}

module.exports = GetUnpaidJobs;
