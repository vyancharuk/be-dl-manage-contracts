const Joi = require('joi');

const BaseService = require('../../common/baseService');
const { CustomError } = require('../../common/types');
const ContractsDal = require('./dal');

class GetContractById extends BaseService {
  static validationRules = {
    profileId: Joi.number().min(1),
    contractId: Joi.number().min(1).required(),
  };

  contractDal = new ContractsDal();

  async execute(validatedUserData) {
    const {
      profile,
      profileId,
      contractId,
    } = validatedUserData;

    this.logInfo('GetContractById:profileId', profileId, 'profile=', profile, 'contractId=', contractId);

    const contract = await this.contractDal.findById(contractId);

    if (contract && (contract.ContractorId === profileId || contract.ClientId === profileId)) {
      return contract;
    }

    return null;
  }
}

module.exports = GetContractById;
