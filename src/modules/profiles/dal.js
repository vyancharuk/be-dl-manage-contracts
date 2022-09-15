const BaseDal = require('../../common/baseDal');
const { Profile } = require('../../model');

class ProfilesDal extends BaseDal {
    async findById(id) {
        return Profile.findOne(
            { where: { id } },
            this.getOptions()
        );
    }

    async findByIds(ids) {
        return Profile.findAll(
            { where: { id: ids } },
            this.getOptions()
        );
    }

    async updateBalance(id, balance) {
        this.logInfo('DAL:updateBalance:id=', id, 'balance=', balance);

        return Profile.update(
            { balance },
            {
                where: { id },
                // apply transaction if needed
                ...this.getOptions()
            },

        );
    }

}

module.exports = ProfilesDal;