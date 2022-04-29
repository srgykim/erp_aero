`use strict`;

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class File extends Sequelize.Model {}
    File.init({
        fileName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: `Please provide a value for "filename"`,
                },
                notEmpty: {
                    msg: `Please provide a value for "filename"`,
                },
            },
        },
        originalName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: `Please provide a value for "originalName"`,
                },
                notEmpty: {
                    msg: `Please provide a value for "originalName"`,
                },
            },
        },
        extension: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: `Please provide a value for "extension"`,
                },
                notEmpty: {
                    msg: `Please provide a value for "extension"`,
                },
            },
        },
        mimeType: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: `Please provide a value for "MIME type"`,
                },
                notEmpty: {
                    msg: `Please provide a value for "MIME type"`,
                },
            },
        },
        size: {
            type: Sequelize.BIGINT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: `Please provide a value for "size"`,
                },
                notEmpty: {
                    msg: `Please provide a value for "size"`,
                },
            },
        },
    }, {
        paranoid: true,
        modelName: `file`,
        sequelize,
    });

    return File;
};
