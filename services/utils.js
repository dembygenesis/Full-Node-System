var express = require('express'),
    _       = require('lodash'),
    fs      = require('fs'),
    http    = require('http'),
    https    = require('https'),
    bcrypt  = require('bcrypt-nodejs'),
    rimraf  = require('rimraf'),
    db      = require('./database/database'),
    csv     = require('csv-parse'),
    saltRounds = 10,
    myPlaintextPassword = 's0/\/\P4$$w0rD';

var Utils = (function () {

    function responseBuilder(http_code, response_code, response_msg, data) {
        return {
            http_code: http_code,
            response_code: response_code,
            response_msg: response_msg,
            data: data
        }
    }

    function slugifier(text) {
        return text.trim().toLowerCase().replace(/ /g,'_').replace(/[^\w-]+/g,'');
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function extractErrorMessages(errors)  {
        if (errors.length > 1) {
            var error_messages = {};

            for (var i in errors) {
                var param = errors[i].param,
                    msg = errors[i].msg;

                error_messages[param] = msg;
            }

            return error_messages;
        } else {
            var error = {};

            error[errors[0].param] = errors[0].msg;

            return error;
        }
    }

    function getObjectByProperty(object, property, value) {

    }

    function readFileDir(dir) {
        return new Promise((resolve, reject) => {
            let filesInDir = [];

            fs.readdir(dir, (err, files) => {
                files.forEach(file => {
                    filesInDir.push(file);
                });

                resolve(filesInDir);
            });
        });
    }

    function readFile(dir) {
        let file_data = fs.readFileSync(dir, "utf-8");

        if (file_data) {
            return file_data;
        } else {
            return false;
        }
    }

    function parseCSVByLocation(dir) {
        return new Promise((resolve, reject) => {
            let csvText= readFile(dir);
            const output = [];

            csv(csvText)
                .on('readable', function(){
                    let record;
                    while (record = this.read()) {
                        output.push(record)
                    }

                    resolve(output);
                });
        })
    }

    function getFileIfExists(dir) {
        return new Promise((resolve, reject) => {
            fs.access(dir, 'utf8', function(err, contents) {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    function extractRequestParams(req) {
        return !_.isEmpty(req.body) ? req.body : (!_.isEmpty(req.query) ? req.query : {});
    }

    function isArrayAndNotEmpty (array) {
            // Check if type array.
            if (array.constructor !== Array) {
                return false;
            } else if (array.length === 0) {
                // Check if type if greater than 0.
                return false;
            } else {
                // Is array and has variables.
                return true;
            }
    }

    function hasArrayIndex (index, array) {
        if (!isArrayAndNotEmpty(array)) {
            return false;
        } else if ((array.indexOf(index) > -1)) {
            return true;
        } else {
            return false;
        }
    }

    function bCrypt(password) {
        // Use salt rounds configured above.
        return bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));
    }

    /**
     * Compared an hashed and encrypted password the a plaintext password.
     * @param  {[type]} password   [description]
     * @param  {[type]} comparator [description]
     * @return {[type]}            [description]
     */
    function bCryptCompare(password, comparator) {
        if (bcrypt.compareSync(password, comparator)) {
            return true;
        } else {
            return false;
        }
    }

    function getParam (req, property) {
        return (req.method === 'GET') ? req.query[property] : req.body[property];
    }

    function httpGet(url) {
        return new Promise(function (resolve, reject) {
            http.get(url, function(res){
                var body = '';

                res.on('data', function(chunk){
                    body += chunk;
                });

                res.on('end', function() {
                    // resolve(JSON.parse(body));
                    resolve(body);
                });
            }).on('error', function(e){
                  console.log("HTTP GET error: ", e);
                  reject(e);
            }); 
        });
    }

    function httpsGet(url) {
        return new Promise(function (resolve, reject) {
            https.get(url, function(res){
                var body = '';

                res.on('data', function(chunk){
                    body += chunk;
                });

                res.on('end', function() {
                    // resolve(JSON.parse(body));
                    resolve(body);
                });
            }).on('error', function(e){
                  console.log("HTTP GET error: ", e);
                  reject(e);
            }); 
        });
    }

    function covertArrTypeToString(arr) {
        arr = arr.map(function (id) {
            return String(id);
        });

        return arr;
    }

    function filterInventoryValues(arr, filter) {
        for (var i = arr.length - 1; i >= 0; i--) {
            if (filter.indexOf(arr[i]['assetid']) === -1) { 
                arr.splice(i, 1);
            } 
        }

        return arr;
    }

    function getArrUniqueValues(arr) {
        // Credits: https://stackoverflow.com/questions/1960473/unique-values-in-an-array
        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index;
        }

        return arr.filter(onlyUnique);
    }

    function objectChecker(obj, obj_properties) {
        if (typeof obj !== 'undefined') {

            // Check if it is in "dot" format and convert if it is.
            if (typeof obj_properties === 'string') {
                obj_properties = obj_properties.split('.');
            }

            for (var i = 0; i < obj_properties.length; i++) {
                if (typeof obj !== "object") {
                    obj = [];
                    break;
                }

                if (!(obj_properties[i] in obj)) {
                    obj = false;
                    break;
                } else {
                    obj = obj[obj_properties[i]];
                }
            }
        }

        return obj;
    }

    function getAccountViaSteamID(steam_id) {
        var username = '';
        var usernames = global.bots['STEAM_IDS'];

        Object.keys(usernames).map(function (key, index) {
            if (usernames[key] == steam_id) {
                username = key;
            }
        });

        return username;
    }

    /**
     * Expects a multi-array and aggregates a column specified.
     * @param data
     * @param array
     */
    function aggregateResults(data, idx) {
        return data.map((value) => {
            return value;
        }).reduce((accumulator, value) => {
            return accumulator + parseFloat(value[idx]);
        }, 0);
    }

    function getDateRangesFromHeader(headerArgs, start_date, end_date) {
        let dateRanges = [];

        for (var i in headerArgs) {
            if (headerArgs[i] === 's') {
                dateRanges.push(start_date);
            }

            if (headerArgs[i] === 'e') {
                dateRanges.push(end_date);
            }
        }

        return dateRanges;
    }

    function getProviderTypes(database, provider_type) {

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                  a.meta_value,
                  c.meta_key,
                  c.meta_value
                FROM
                  wp_postmeta a
                  INNER JOIN wp_posts b
                    ON 1 = 1
                    AND a.post_id = b.ID
                  INNER JOIN wp_postmeta c
                    ON 1 = 1
                    AND b.ID = c.post_id
                WHERE 1 = 1 
                   AND a.meta_value = '${database}'
                   AND c.meta_key IN ('doc_ids', 'hyg_ids', 'ort_ids', 'spc_ids')
            `;

            let hygienists = []
                , specialists = []
                , doctors = []
                , orthodontists = [];

            const providers = {};

            db.queryLocal(sql)
                .then(res => {

                    // Populate.
                    for (let i in res) {
                        let meta_value = res[i]['meta_value'].split(',');
                        let meta_key = res[i]['meta_key'];

                        if (meta_key === 'doc_ids') {
                            doctors = meta_value;
                        }

                        if (meta_key === 'hyg_ids') {
                            hygienists = meta_value;
                        }

                        if (meta_key === 'ort_ids') {
                            orthodontists = meta_value;
                        }

                        if (meta_key === 'spc_ids') {
                            specialists = meta_value;
                        }
                    }

                    hygienists = hygienists.map(str => "'" + str + "'").join();
                    specialists = specialists.map(str => "'" + str + "'").join();
                    doctors = doctors.map(str => "'" + str + "'").join();
                    orthodontists = orthodontists.map(str => "'" + str + "'").join();

                    hygienists = hygienists === '' ? "''" : hygienists;
                    specialists = specialists === '' ? "''" : specialists;
                    doctors = doctors === '' ? "''" : doctors;
                    orthodontists = orthodontists === '' ? "''" : orthodontists;

                    providers['({$hygienist})'] = hygienists.replace(/(^,)|(,$)/g, "");
                    providers['({$specialist})'] = specialists.replace(/(^,)|(,$)/g, "");
                    providers['({$provider})'] = doctors.replace(/(^,)|(,$)/g, "");

                    if (typeof provider_type !== "undefined") {
                        if (provider_type === 'doctor') {
                            resolve(providers[`({$provider})`]);
                        } else {
                            resolve(providers[`({$${provider_type}})`]);
                        }
                    } else {
                        resolve(providers);
                    }
                })
                .catch(error => {
                    console.log('error when fetching the provider type ids', error);
                })
        })
    }

    function stripHeaders(str) {
        return str.split('\n').splice(1, str.length).join('\n');
    }

    function injectProviderIds(sql, provider_ids) {
        // console.log('provider_ids', provider_ids);

        for (let i in provider_ids) {

            let escapedPattern = i.replace(/\(/, '\\(') // Escape "("
                .replace(/\)/, '\\)') // Escape ")"
                .replace(/\$/, '\\$') // Escape "$"
            ;

            escapedPattern = new RegExp(escapedPattern, "g");

            sql = sql.replace(escapedPattern, '(' + provider_ids[i] + ')');
        }

        return sql;
    }

    function injectStartAndEndDates(sql, dateHeaderInjections, start_date, end_date) {

        dateHeaderInjections = dateHeaderInjections.replace(/-|,/g, '');

        for (let i in dateHeaderInjections) {
            const date_injection = dateHeaderInjections[i] === 's' ? start_date : end_date;

            sql = sql.replace('%s', date_injection);
        }

        return sql;
    }

    function injectDatabaseInTables(sql) {
        return sql;
    }

    function getOfficeTables(database) {
        return new Promise((resolve, reject) => {
            db.query(`
                SELECT TABLE_NAME AS \`table\`
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = '${database}'
            `)
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    function getDatabases(dbPrefix) {
        return new Promise((resolve, reject) => {
            const sql = `
                SHOW DATABASES WHERE \`Database\` LIKE '${dbPrefix}%'
            `;

            db.query(sql)
                .then(data => {
                    resolve(data);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    function getDatabaseType(database) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT stored_procs.v5_get_database_type('${database}') AS database_type
            `;

            db.query(sql)
                .then(data => {
                    resolve(data[0]['database_type']);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    function generateCSVOuput(database, values, header, cb) {

        console.log('I am going to write: ' + values.length + ' characters to : ' + database);

        if (typeof header !== "undefined") {
            values = header + '\n' + values;
        }

        var dir = `public/${database}_report.csv`;


        fs.exists(dir, (exists) => {
            if (exists) {

                console.log('exists', exists);

                fs.unlink(dir, (err) => {
                    if (err) {
                        console.log('err', err);
                        console.log('unlink error');
                        throw err;
                    } else {
                        fs.appendFile(dir, values, function (err) {
                            if (err) {
                                console.log('failed write.');
                                console.log(err);

                            } else {
                                console.log('Finished inserting.');

                            }
                        });
                    }

                    if (typeof cb !== "undefined") {
                        cb();
                    }
                });
            } else {
                fs.appendFile(dir, values, function (err) {
                    if (err) {
                        console.log('failed write.');

                    } else {
                        console.log('Finished inserting.');

                    }
                });

                if (typeof cb !== "undefined") {
                    cb();
                }
            }
        });
    }

    function escapeStringForInsert(str) {
        let stringified = str.toString();

        stringified = stringified.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char; // prepends a backslash to backslash, percent,
                                      // and double/single quotes
            }
        });

        // s to be sprinkler protected however, car parks deemed
        stringified = stringified.replace(/"/g, `'`);

        return stringified;
    }

    function removeFilesInDir(dir) {
        return new Promise((resolve, reject) => {
            try {
                rimraf(`${dir}/*`, function () {
                    resolve(true);
                })
            } catch(err) {
                reject(`Failed to delete files in directory: '${dir}'`);
            }
        });
    }

    return {
        removeFilesInDir: removeFilesInDir,
        escapeStringForInsert: escapeStringForInsert,
        parseCSVByLocation: parseCSVByLocation,
        aggregateResults: aggregateResults,
        generateCSVOuput: generateCSVOuput,
        getDatabaseType: getDatabaseType,
        getOfficeTables: getOfficeTables,
        getDatabases: getDatabases,
        injectDatabaseInTables: injectDatabaseInTables,
        injectStartAndEndDates: injectStartAndEndDates,
        stripHeaders: stripHeaders,
        injectProviderIds: injectProviderIds,
        getDateRangesFromHeader: getDateRangesFromHeader,
        getProviderTypes: getProviderTypes,
        responseBuilder: responseBuilder,
        objectChecker: objectChecker,
        getArrUniqueValues: getArrUniqueValues,
        slugifier: slugifier,
        validateEmail: validateEmail,
        extractErrorMessages: extractErrorMessages,
        getObjectByProperty: getObjectByProperty,
        readFile: readFile,
        readFileDir: readFileDir,
        getFileIfExists: getFileIfExists,
        extractRequestParams: extractRequestParams,
        isArrayAndNotEmpty: isArrayAndNotEmpty,
        hasArrayIndex: hasArrayIndex,
        bCrypt: bCrypt,
        bCryptCompare: bCryptCompare,
        httpGet: httpGet,
        httpsGet: httpsGet,
        covertArrTypeToString: covertArrTypeToString,
        filterInventoryValues: filterInventoryValues,
        getAccountViaSteamID: getAccountViaSteamID,
        getParam: getParam
    }
})();

module.exports = Utils;
