const mongoose = require('mongoose'),
    mysql = require('mysql'),
    config = require('../../config'),
    logger = require('../logger');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

const connectionMongo = mongoose.connect(config.database.mongoose.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const connectionMysql = mysql.createConnection({
    host: config.database.mysql.host,
    user: config.database.mysql.user,
    password: config.database.mysql.password,
    database: config.database.mysql.database
});

connectionMysql.connect(function(err) {
    if (err) {
        logger.error('Error while attempting to connect to database MyQSL:');
        logger.error(err);
    }

    console.log('connected as id ' + connectionMysql.threadId);
});


connectionMongo
    .then(db => {
        logger.info(
            `Successfully connected to ${config.database.uri} MongoDB cluster in ${
				config.env
			} mode.`,
        );
        return db;
    })
    .catch(err => {
        if (err.message.code === 'ETIMEDOUT') {
            logger.info('Attempting to re-establish database connection.');
            mongoose.connect(config.database.uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        } else {
            logger.error('Error while attempting to connect to database MongoDB:');
            logger.error(err);
        }
    });

module.exports = {
    mysql: connectionMysql,
    mongodb: connectionMongo,
};