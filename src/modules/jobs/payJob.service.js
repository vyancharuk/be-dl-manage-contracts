const Joi = require('joi');

const BaseService = require('../../common/baseService');

const JobsDal = require('./dal');
const ContractsDal = require('../contracts/dal');
const { CustomError, HTTP_STATUS } = require('../../common/types');

class PayJob extends BaseService {
    static validationRules = {
        profileId: Joi.number().min(1),
        jobId: Joi.number().min(1).required(),
    };

    jobsDal = new JobsDal();
    contractDal = new ContractsDal();

    async execute(validatedUserData) {
        const {
            profile,
            profileId,
            jobId,
        } = validatedUserData;

        this.logInfo('PayJob:profileId', profileId, 'jobId=', jobId, 'profile', profile);

        const job = await this.jobsDal.findById(jobId);

        if (!job) {
            throw new CustomError(HTTP_STATUS.NOT_FOUND, 'JOB_DO_NOT_EXISTS');
        }

        if (job.paid) {
            throw new CustomError(HTTP_STATUS.BAD_REQUEST, 'JOB_ALREADY_PAID');
        }

        const currentContract = await this.contractDal.findById(job.ContractId);

        this.logInfo('PayJob:currentContract', currentContract);

        if (!currentContract) {
            throw new CustomError(HTTP_STATUS.BAD_REQUEST, 'JOB_DO_NOT_HAS_CONTRACT');
        }

        if (currentContract.status !== 'in_progress') {
            throw new CustomError(HTTP_STATUS.BAD_REQUEST, 'JOB_DO_NOT_HAS_ACTIVE_CONTRACT');
        }

        if (currentContract.ClientId !== profileId) {
            throw new CustomError(HTTP_STATUS.UNAUTHORIZED, 'DO_NOT_HAVE_ACCESS_TO_PASSED_JOB');
        }

        const contractorId = currentContract.ContractorId;
        const contractor = await this.profilesDal.findById(contractorId);

        const amount = job.price;

        this.logInfo('PayJob:amount=', amount, 'balance=', profile.balance);

        if (amount > profile.balance) {
            throw new CustomError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'LOW_BALANCE_TO_PAY_FOR_A_JOB');
        }

        await this.profilesDal.updateBalance(contractorId, 1 * contractor.balance + 1 * amount);
        await this.profilesDal.updateBalance(profileId, profile.balance - amount);

        await this.jobsDal.setPaid(jobId);

        // TODO: can return updated entities
        return { paid: true }
    }
}

module.exports = PayJob;
