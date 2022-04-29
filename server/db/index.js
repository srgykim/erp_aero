`use strict`;

const Sequelize = require(`sequelize`);

const env = process.env.NODE_ENV || `development`;
const config = require(__dirname + `/config/config.json`)[env];

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {
    sequelize,
    Sequelize,
    models: {},
};

db.models.User = require('./models/user.js')(sequelize);
db.models.Whitelist = require('./models/whitelist.js')(sequelize);
db.models.Blacklist = require('./models/blacklist.js')(sequelize);
db.models.File = require('./models/file.js')(sequelize);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
