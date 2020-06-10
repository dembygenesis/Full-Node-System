const mysql = require('mysql');

/**
 * Database connection.
 */

global.connection = [];
global.lastUsedConnection = 0;

function establishConnection() {
    // Generate Connections.
    for (let i = 0; i < process.env.DB_CONNECTIONS; i++) {

        let config = {
            "host":     process.env.DB_HOST,
            "user":     process.env.DB_USER,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_DATABASE,
            "supportBigNumbers": true,
            "bigNumberStrings": true
        };

        if (process.env.DB_PORT) {
            config['port'] = process.env.DB_PORT;
        }

        global.connection.push(mysql.createConnection(config));

        global.connection[i].connect(function(err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                process.exit();
            } else {
                console.log('MYSQL connection established.');
            }
        });
    }
}

module.exports = establishConnection;