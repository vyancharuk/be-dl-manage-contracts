const Joi = require('joi');

const BaseService = require('../../common/baseService');
const { CustomError, HTTP_STATUS } = require('../../common/types');
const JobsDal = require('../jobs/dal');
const ContractsDal = require('../contracts/dal');

class GetBestProfession extends BaseService {
    static validationRules = {
        profileId: Joi.number().min(1),
        start: Joi.string().allow('', null),
        end: Joi.string().allow('', null),
    };

    jobsDal = new JobsDal();
    contractsDal = new ContractsDal();

    async execute(validatedUserData) {
        const {
            profile,
            profileId,
            start,
            end,
        } = validatedUserData;

        this.logInfo('GetBestProfession:profileId', profileId, 'profile=', profile,
            'start=', start,
            'end=', end);

        // check that user can execute admin operation
        if (profile.type !== 'admin') {
            throw new CustomError(HTTP_STATUS.UNAUTHORIZED, 'ADMIN_PERMISSIONS_REQUIRED')
        }

        const startDate = start ? new Date(start) : start;
        const endDate = end ? new Date(end) : end;

        const paidJobs = await this.jobsDal.findByPaidDates(startDate, endDate);

        this.logInfo('GetBestProfession:paidJobs=', paidJobs);

        const contractIds = paidJobs.map(j => j.ContractId);

        this.logInfo('GetBestProfession:contractIds=', contractIds);

        const contracts = await this.contractsDal.findByIds(contractIds);

        const contractorIds = contracts.map(j => j.ContractorId);

        const contractors = await this.profilesDal.findByIds(contractorIds);

        this.logInfo('GetBestProfession:contractorIds=', contractorIds,
            'contractors=', contractors);

        const paidJobsAmount = paidJobs.reduce((contractorMap, j) => {
            const contract = contracts.find(c => c.id === j.ContractId);
            const contractor = contractors.find(c => c.id === contract.ContractorId);

            const profession = contractor.profession;

            if (!contractorMap[profession]) {
                contractorMap[profession] = 0
            }

            contractorMap[profession] += j.price;

            return contractorMap;
        }, {});

        this.logInfo('GetBestProfession:paidJobsAmount=', paidJobsAmount);

        const professions = Object.keys(paidJobsAmount);

        let maxPaidProfession;
        let maxPaidAmount = 0;

        for (const profession of professions) {
            if (paidJobsAmount[profession] > maxPaidAmount) {
                maxPaidAmount = paidJobsAmount[profession];
                maxPaidProfession = profession;
            }
        }

        this.logInfo('GetBestProfession:maxPaidProfession=', maxPaidProfession);

        return { bestProfession: maxPaidProfession };
    }
}

module.exports = GetBestProfession;
