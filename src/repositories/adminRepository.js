const { Contract, Profile, Job } = require('../model'); 
const { Op, Sequelize } = require('sequelize'); // Import Op from sequelize

/**
 * Fetch profession earnings in a given date range
 * @param {string} start - Start date in YYYY-MM-DD format
 * @param {string} end - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} - List of professions with their total earnings
 */
const getProfessionEarnings = async (start, end) => {
  return await Job.findAll({
      attributes: [
        [Sequelize.col('Contract.Contractor.profession'), 'profession'],
        [Sequelize.fn('SUM', Sequelize.col('price')), 'total']
      ],
      include: [
        {
          model: Contract,
          attributes: [],
          include: [
            {
              model: Profile,
              as: 'Contractor',
              attributes: ['profession']
            }
          ]
        }
      ],
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [start, end]
        }
      },
      group: ['Contract.Contractor.profession'],
      order: [[Sequelize.literal('total'), 'DESC']],
      limit: 1
    })
};


/**
 * Get the best clients based on payments made within a date range.
 * @param {string} start - Start date
 * @param {string} end - End date
 * @param {number} limit - Limit for the number of clients to return
 * @returns {Promise<Array>} - List of best clients
 */
const getBestClients = async (start, end, limit) => {
  return await Job.findAll({
    attributes: [
      [Sequelize.col('Contract.Client.id'), 'id'],
      [
        Sequelize.literal(
          "`Contract->Client`.`firstName` || ' ' ||  `Contract->Client`.`lastName`"
        ),
        'fullName'
      ],
      [Sequelize.fn('SUM', Sequelize.col('price')), 'paid']
    ],
    include: [
      {
        model: Contract,
        attributes: [],
        include: [
          {
            model: Profile,
            as: 'Client',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      }
    ],
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [start, end]
      }
    },
    group: ['Contract.Client.id'],
    order: [[Sequelize.literal('paid'), 'DESC']],
    limit
  })
};


module.exports = {
    getProfessionEarnings,
    getBestClients,
};
