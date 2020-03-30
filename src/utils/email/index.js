const fs = require('fs'),
    ejs = require('ejs'),
    sendgrid = require('@sendgrid/mail'),
    logger = require('../logger'),
    config = require('../../config');

const email = data => {
    if (!data.type || !data.email) {
        return new Promise(reject => {
            const err = 'Missing data.type OR data.email!';
            logger.error(err);
            reject(err);
        });
    }

    return new Promise((resolve, reject) => {
        if (config.env === 'test' || config.env === 'local') {
            return resolve();
        }

        sendgrid.setApiKey(config.email.sendgrid.secret);
        const type = data.type.toLowerCase();

        if (data.type === 'welcome') {
            const msg = ejs.render(
                fs.readFileSync(__dirname + '/templates/welcome.ejs', 'utf8'),
            );

            const obj = {
                to: data.email,
                from: {
                    name: config.email.sender.default.name,
                    email: config.email.sender.default.email,
                },
                subject: 'Welcome to Winds!',
                content: [{
                    type: 'text/html',
                    value: msg,
                }, ],
            };

            sendgrid
                .send(obj)
                .then(res => {
                    resolve(res);
                })
                .catch(err => {
                    logger.error(err);
                    reject(err);
                });
        }

        if (data.type === 'password') {
            if (!data.passcode) {
                return new Promise(reject => {
                    const err = 'Missing data.passcode!';
                    logger.error(err);
                    reject(err);
                });
            }

            const msg = ejs.render(
                fs.readFileSync(__dirname + '/templates/password.ejs', 'utf8'), {
                    passcode: data.passcode
                },
            );

            const obj = {
                to: data.email,
                from: {
                    name: config.email.sender.support.name,
                    email: config.email.sender.support.email,
                },
                subject: 'Forgot Password',
                content: [{
                    type: 'text/html',
                    value: msg,
                }, ],
            };

            sendgrid
                .send(obj)
                .then(res => {
                    resolve(res);
                })
                .catch(err => {
                    logger.error(err);
                    reject(err);
                });
        }
    });
};


module.exports = email;