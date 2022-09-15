const BaseDal = require('../../common/baseDal');
const { Contract, Sequelize } = require('../../model');
const { Op } = Sequelize;

class ContractsDal extends BaseDal {
    async findById(id) {
        return Contract.findOne(
            { where: { id } },
            this.getOptions()
        );
    }

    async findByIds(ids) {
        return Contract.findAll(
            { where: { id: ids } },
            this.getOptions()
        );
    }

    // async findAllByProfileId(profileId) {
    //     this.logInfo('DAL:findAllByProfileId:profileId=', profileId);

    //     const contracts = await Contract.findAll(
    //         {
    //             where: {
    //                 [Op.or]: [
    //                     { ContractorId: profileId },
    //                     { ClientId: profileId },
    //                 ]
    //             }
    //         },
    //         this.getOptions()
    //     );

    //     return contracts;
    // }

    async findAllByStatus(profileId, status) {
        this.logInfo('DAL:findAllByStatus:status=', status);

        const contracts = await Contract.findAll(
            {
                where: {
                    [Op.or]: [
                        {
                            ContractorId: profileId,
                            status
                        },
                        {
                            ClientId: profileId,
                            status
                        },
                    ]
                }
            },
            this.getOptions()
        );

        return contracts;
    }
}

module.exports = ContractsDal;