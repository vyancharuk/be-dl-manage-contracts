const BaseDal = require('../../common/baseDal');
const { Job, Sequelize } = require('../../model');
const { Op } = Sequelize;

class JobsDal extends BaseDal {
    async findById(id) {
        const job = await Job.findOne(
            { where: { id } },
            this.getOptions()
        );

        return job;
    }

    async findAllUnpaid(contractIds) {
        this.logInfo('jobs:DAL:findAllUnpaid:contractIds=', contractIds);

        const jobs = await Job.findAll(
            {
                where: {
                    paid: {
                        [Op.not]: true
                    },
                    ContractId: contractIds
                }
            },
            this.getOptions()
        );

        return jobs;
    }


    async setPaid(id) {
        this.logInfo('jobs:DAL:setPaid:id=', id);

        return Job.update(
            {
                paid: true,
                paymentDate: new Date()
            },
            {
                where: { id },
                // apply transaction if needed
                ...this.getOptions()
            },

        );
    }

    async findByPaidDates(startDate, endDate) {
        this.logInfo('jobs:DAL:findByPaidDates:startDate=', startDate, 'endDate=', endDate);

        const conditions = [];

        if (startDate) {
            conditions.push({
                [Op.gt]: startDate
            });
        }

        if (endDate) {
            conditions.push({
                [Op.lt]: endDate
            });
        }

        const jobs = await Job.findAll(
            {
                where: {
                    paymentDate: {
                        [Op.and]: conditions
                    }
                }
            },
            this.getOptions()
        );

        return jobs;
    }

}

module.exports = JobsDal;