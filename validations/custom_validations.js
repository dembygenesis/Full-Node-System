let Promise = require('promise'),
    _       = require('lodash'),
    fs      = require('fs'),
    Utils      = require('../services/utils'),
    db      = require('../services/database/database');

module.exports = {
    customValidators: {
        /**
         * Check if there an existing ID for a sp
         * @param query_str
         * @param table_name
         * @returns {*}
         */
        columnExists: function (query_str, table_name) {
            return new Promise(function (resolve, reject) {
                db.query('SELECT * FROM ' + table_name + ' WHERE id = ?', [query_str]).then(function (response) {
                    if (_.isEmpty(response) === false) {
                    } else {
                        reject(response);
                    }
                });
            });
        },
        // This should be hasEntriesOrEmptyData, I think I need a new function.
        hasEntriesOrEmpty: function (query_str, table_name, column, is_active) {
            if (typeof query_str === "undefined") {
                return new Promise(function (resolve, reject) {
                    resolve('Undefined parameter');
                });
            } else {
                return new Promise(function (resolve, reject) {

                    let sql = `SELECT * FROM ${table_name} WHERE ${column} = ?`;

                    if (is_active) {
                        sql = `SELECT * FROM ${table_name} WHERE ${column} = ? AND is_active = 1`;
                    }

                    db.query(sql, [query_str]).then(function (response) {
                        console.log('=====================');
                        console.log(sql);
                        if (_.isEmpty(response) === false) {
                            resolve(response);
                        } else {
                            reject(response);
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                });
            }
        },
        /**
         * Checks if there are existing records for a specific table and column.
         * @param query_str
         * @param table_name
         * @param column
         * @param exception_column
         * @returns {*}
         */
        hasEntries: function (query_str, table_name, column, is_active) {
            if (typeof query_str === "undefined") {
                return new Promise(function (resolve, reject) {
                    reject('Undefined parameter');
                });
            } else {
                return new Promise(function (resolve, reject) {
                    let sql = `SELECT * FROM ${table_name} WHERE ${column} = ?`;

                    if (is_active) {
                        sql = `SELECT * FROM ${table_name} WHERE ${column} = ? AND is_active = 1`;
                    }

                    db.query(sql, [query_str], 1).then(function (response) {
                        if (_.isEmpty(response) === false) {
                            resolve(response);
                        } else {
                            reject(response);
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                });
            }
        },
        /**
         * Checks (a specific column) if there are no entries in the database.
         * @param  {[type]}  query_str  [description]
         * @param  {[type]}  table_name [description]
         * @param  {[type]}  column     [description]
         * @return {Boolean}            [description]
         */
        hasNoEntries: function (query_str, table_name, column) {

            if (typeof query_str === "undefined") {
                return new Promise(function (resolve, reject) {
                    reject('Undefined parameter');
                });
            } else {
                return new Promise(function (resolve, reject) {

                    db.query('SELECT * FROM ' + table_name + ' WHERE ' + column + ' = ?', [query_str]).then(function (response) {
                        if (_.isEmpty(response) === false) {
                            reject(response);
                        } else {
                            resolve(response);
                        }
                    });
                });
            }
        },
        /**
         * Checks (a specific column) if there are no entries in the database, except it's own row.
         * @param  {[type]}  query_str  [description]
         * @param  {[type]}  table_name [description]
         * @param  {[type]}  column     [description]
         * @return {Boolean}            [description]
         */
        hasNoEntriesExceptOwn: function (query_str, table_name, column, id, id_override) {
            if (typeof query_str === "undefined") {
                return new Promise(function (resolve, reject) {
                    reject('Undefined parameter');
                });
            } else {
                return new Promise(function (resolve, reject) {
                    let sql = '';

                    if (typeof id_override !== "undefined") {
                        sql = 'SELECT * FROM ' + table_name + ' WHERE ' + column + ` = ? AND ${id_override} != ?`;

                        console.log('SELECT * FROM ' + table_name + ' WHERE ' + column + ` = ${query_str} AND ${id_override} != ${id}`);
                    } else {
                        sql = 'SELECT * FROM ' + table_name + ' WHERE ' + column + ' = ? AND id != ?';
                    }

                    db.query(sql, [query_str, id]).then(function (response) {
                        if (_.isEmpty(response) === false) {
                            reject(response);
                        } else {
                            resolve(response);
                        }
                    });
                });
            }
        }, 
        /**
         * Do I need to describe? lol
         * @param  {[type]}  query_str [description]
         * @return {Boolean}           [description]
         */
        isGender: function (query_str) {
            if (query_str === 'M' || query_str === 'F') {
                return true;
            } else {
                return false;
            }
        },
        /**
         * Do I need to describe? lol
         * @param  {[type]}  query_str [description]
         * @return {Boolean}           [description]
         */
        isValidRate: function (query_str) {
            return (isNaN(query_str) == false && query_str > 0 ? true : false);
        },
        /**
         * Am I a registered bot? B)
         * @param  {[type]}  query_str [description]
         * @return {Boolean}           [description]
         */
        isBot: function (query_str, status) {
            // Check bot usernames.
            if (status === true) {
                if (typeof global.bots['usernames'][query_str] !== "undefined") {
                    return true;
                }
                else {
                    return false;
                }
            } else if (status === false) {
                let status = true;

                Object.keys(global.bots['STEAM_IDS']).map((key, index) => {
                    if (global.bots['STEAM_IDS'][key] == query_str) {    
                        status = false;
                    }
                });

                return status;
            }
        },
        /**
         * ^^
         * @param  {[type]}  dir [description]
         * @return {Boolean}     [description]
         */
        hasFile: function (dir) {
            if (typeof dir === "undefined") {
                return new Promise(function (resolve, reject) {
                    reject('Undefined parameter');
                });
            } else {
                return new Promise(function (resolve, reject) {
                    fs.stat(global.appRoot + dir, function (err, stat) {
                        if (err) {
                            reject(err);
                        } else {
                            if (stat.isFile()) {
                                resolve(true);
                            } else {
                                reject(false);
                            }
                        }
                    });
                });
            }
        },
        /**
         * Checks if the variable passed is present within the array.
         * @param  {[type]}  values [description]
         * @return {Boolean}        [description]
         */
        hasArrValues: function (index, array) {
            return Utils.hasArrayIndex(index, array);
        },
        isValidCCFormat: function (cc) {
            if (typeof cc !== "undefined") {
                // CC can be empty but not undefined, so if it's an empty string just return it.
                if (cc.trim() === "") {
                    return true;
                } else {
                    cc = cc.split(',');

                    // If array do multiple validations - else do a single one.
                    if (cc.length > 0) {
                        for (let i in cc) {
                            cc[i] = cc[i].trim();

                            if (Utils.validateEmail(cc[i]) === false) {
                                return false;
                            } 
                        }

                        return true;
                    } else {
                        // Else do single validation.
                        if (Utils.validateEmail(cc[0]) === false) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                }
            } else {
                return false;
            }
        },
        isEmail: function (a) {
            return Utils.validateEmail(a)
        },
        isSecretKey: function (a) {
            if (process.env.API_KEY === a) {
                return true;
            } else {
                return false;
            }
        },
        isAuthKey: function (a) {

        },
        inArrayValues: function (val, arr) {
            return arr.indexOf(val) !== -1;
        },
        isArrayButCanBeEmpty: function (val) {
            console.log('Array.isArray(val): ' + Array.isArray(val));

            return Array.isArray(val);
        },
        commaDelimitedValuesMustBeUnique: function (commaDelimitedString) {
            return new Promise((resolve, reject) => {
                const commaDelimitedStringToArr = commaDelimitedString.split(',');

                const valid = _.uniq(commaDelimitedStringToArr).length === commaDelimitedStringToArr.length;

                if (valid) {
                    resolve();
                } else {
                    reject();
                }
            });

        },
        isValidDateFormat: function (val) {
            const parsedDate = Date.parse(val);

            return isNaN(parsedDate) === false;
        }
    }
};