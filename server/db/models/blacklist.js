`use strict`;

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class Blacklist extends Sequelize.Model {}
    Blacklist.init({
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
        modelName: `blacklist`,
        sequelize,
    });

    return Blacklist;
};
