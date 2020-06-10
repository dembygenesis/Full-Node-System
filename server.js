// Environment settings.
require('dotenv').config();

const PORT = process.env.PORT;

const express              = require('express');
const path    			   = require('path');
const express_validator    = require('express-validator');
const request_param        = require('request-param');
const bodyParser           = require('body-parser');
const CustomValidations    = require('./validations/custom_validations');
const mysql                = require('mysql');
const cors                 = require('cors');
const upload               = require('express-fileupload');
const billing               = require('./billing');

var CronJob = require('cron').CronJob;


let app = express();

app.use(cors());
app.use(upload());

// Enable CORS.
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Add sanitation.
app.use(require('sanitize').middleware);

let http = require('http').Server(app);
global.io = require('socket.io')(http);

/**
 * Database connection.
 */

global.connection = [];
global.lastUsedConnection = 0;

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

/**
 * UI config and public files.
 */
global.appRoot = require('app-root-path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Load POST body parser and custom validation middlewares;
 */
app.use(bodyParser.json());
app.use(request_param());
app.use(express_validator(CustomValidations));

app.listen(PORT, function () {

    /**
     * ================
     * Bootstrap routes
     * ================
     */
    const routeBootstrapper = require('./routes/');
          routeBootstrapper(app);

    if (process.env.ENABLE_NOTIFICAITON_ENGINE) {
        let notificationEngine = require('./engines/notifications2');

        /**
         * =================
         * Cron jobs.
         * =================
         */

        notificationEngine.runCronJobForDueAndOverdueItems();
        notificationEngine.runCronJobForArchives();
    }

    // Always send main react file for unknown get requests.
    app.get('*', function(req, res) {
        res.sendFile( path.join(__dirname, 'public/index.html') );
    });

    console.log('Listening to Port: ' + PORT);
});
