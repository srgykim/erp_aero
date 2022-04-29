`use strict`;

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class Whitelist extends Sequelize.Model {}
    Whitelist.init({
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: `Please provide a value for "email"`,
                },
                notEmpty: {
                    msg: `Please provide a value for "email"`,
                },
            },
        },
        token: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: `Please provide a value for "token"`,
                },
                notEmpty: {
                    msg: `Please provide a value for "token"`,
                },
            },
        }
    }, {
        paranoid: true,
        modelName: `whitelist`,
        sequelize,
    });

    return Whitelist;
};
