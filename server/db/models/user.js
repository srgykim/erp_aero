`use strict`;

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
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
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: `Please provide a value for "password"`,
                },
                notEmpty: {
                    msg: `Please provide a value for "password"`,
                },
            },
        },
        refreshToken: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: `Please provide a value for "refreshToken"`,
                },
                notEmpty: {
                    msg: `Please provide a value for "refreshToken"`,
                },
            },
        }
    }, {
        paranoid: true,
        modelName: `users`,
        sequelize,
    });

    return User;
};
