const Joi = require('joi');

const BaseService = require('../../common/baseService');
const { CustomError, HTTP_STATUS } = require('../../common/types');

const JobsDal = require('../jobs/dal');
const ContractsDal = require('../contracts/dal');

const DEFAULT_LIMIT = 2;

class GetBestClients extends BaseService {
    static validationRules = {
        profileId: Joi.number().min(1),
        start: Joi.string().allow('', null),
        end: Joi.string().allow('', null),
        limit: Joi.number().min(1).max(1000).allow('', null),
    };

    jobsDal = new JobsDal();
    contractsDal = new ContractsDal();

    async execute(validatedUserData) {
        const {
            profile,
            profileId,
            start,
            end,
            limit = 2
        } = validatedUserData;

        this.logInfo('GetBestClients:profileId', profileId,
            'profile=', profile,
            'start=', start,
            'end=', end,
            'limit=', limit)

        // check that user can execute admin operation
        if (profile.type !== 'admin') {
            throw new CustomError(HTTP_STATUS.UNAUTHORIZED, 'ADMIN_PERMISSIONS_REQUIRED')
        }

        const startDate = start ? new Date(start) : start;
        const endDate = end ? new Date(end) : end;

        const paidJobs = await this.jobsDal.findByPaidDates(startDate, endDate);

        this.logInfo('GetBestClients:paidJobs=', paidJobs);

        const contractIds = paidJobs.map(j => j.ContractId);

        this.logInfo('GetBestClients:contractIds=', contractIds);

        const contracts = await this.contractsDal.findByIds(contractIds);

        // const clientIds = contracts.map(j => j.ClientId);

        // const clients = await this.profilesDal.findByIds(clientIds);

        // this.logInfo('GetBestClients:clients=', clients.length, clients[0]);

        const paidJobsAmountMap = paidJobs.reduce((clientsMap, j) => {
            const contract = contracts.find(c => c.id === j.ContractId);
            // const client = clients.find(c => c.id === contract.ClientId);

            const clientId = contract.ClientId;

            if (!clientsMap[clientId]) {
                clientsMap[clientId] = 0
            }

            clientsMap[clientId] += j.price;

            return clientsMap;
        }, {});

        this.logInfo('GetBestProfession:paidJobsAmount=', paidJobsAmountMap);

        let mostPaidClients = Object.keys(paidJobsAmountMap).map(cId => ({
            id: cId,
            amount: paidJobsAmountMap[cId]
        }));

        mostPaidClients.sort((c1, c2) => {
            if (c1.amount > c2.amount) {
                return -1;
            }

            if (c1.amount < c2.amount) {
                return 1;
            }

            return 0
        });


        this.logInfo('GetBestProfession:mostPaidClients=', mostPaidClients);

        if (!isNaN(parseInt(limit))) {
            mostPaidClients = mostPaidClients.slice(0, limit);
        } else {
            mostPaidClients = mostPaidClients.slice(0, DEFAULT_LIMIT);
        }

        this.logInfo('GetBestProfession:mostPaidClients:after:limit=', mostPaidClients);

        const resultClients = await this.profilesDal.findByIds(mostPaidClients.map(c => c.id));

        this.logInfo('GetBestProfession:mostPaidClients:resultClients=', resultClients);

        return mostPaidClients
            .map(c => {
                const client = resultClients.find(rc => rc.id == c.id);

                return {
                    id: client.id,
                    amount: c.amount,
                    type: client.type,
                    firstName: client.firstName,
                    lastName: client.lastName,
                    profession: client.profession,
                    balance: client.balance,
                }
            })

    }
}

module.exports = GetBestClients;
