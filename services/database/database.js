var express          = require('express'),
    async            = require('async'),
    PromiseWaterfall = require('promise-waterfall'),
    Promise          = require('promise');

var DBService = (function () {

    /**
     * Changes database connection to another one VS the ".env" file.
     */
    function reconfigureConnection(new_db) {
        global.connection = mysql.createConnection({
            "host":     process.env.MB2_DB_HOST,
            "user":     process.env.MB2_DB_USER,
            "password": process.env.MB2_DB_PASSWORD,
            "database": new_db,
            "supportBigNumbers": true,
            "bigNumberStrings": true
        });
    }

    /**
     * Returns an instance of a MYSQL connection. (fetched from global object)
     * @returns {Connection|*}
     */
    function getMySQL_connection () {

        if (global.lastUsedConnection === (process.env.DB_CONNECTIONS - 1) ) {
            global.lastUsedConnection = 0;
        } else {
            global.lastUsedConnection++;
        }

        return global.connection[global.lastUsedConnection];
    }

    function getLocalMySQL_connection () {
        return global.localConnection;
    }

    function queryTransaction (queries) {

        const connection = getMySQL_connection();

        // Begin transaction.
        const transaction = (resolve, reject) => connection.beginTransaction(() => {
            let queryPromises = [];
            let queryResults = [];

            for (let i in queries) {
                const stmt = queries[i].stmt;
                const args = queries[i].args;

                // Enclose in a function because "Promise-Waterfall" lib requires it.
                let queryPromise = () => (new Promise((resolve, reject) => {
                    connection.query(stmt, args, (err, rows, fields) => {
                        if (err) {
                            queryResults.push({
                                sql: stmt,
                                result: 'failed'
                            });

                            reject(err);
                        } else {
                            queryResults.push({
                                sql: stmt,
                                result: 'passed'
                            });

                            resolve(rows);
                        }
                    });
                }));

                queryPromises.push(queryPromise);
            }

            PromiseWaterfall(queryPromises)
                .then(res => {
                    connection.commit(err => {
                        if (err)
                            connection.rollback();
                        
                        resolve(res);
                    });
                })
                .catch(err => {
                    console.log('Rollback inducing error');
                    console.log(err);
                    connection.rollback(() => {
                        console.log('Execute Rollback.');
                        reject();
                    })
                });
        });

        return new Promise((resolve, reject) => {
            transaction(resolve, reject);
        });
    }

    function query (query_str, query_var, showQuery) {

        return new Promise(function(resolve, reject) {
            var connection = getMySQL_connection();

            // There should be a log function here that displays the queries.

            const sqlDebugMode = process.env.SQL_DEBUG_MODE;

            if (showQuery) {
                let sql = query_str;

                for (let i in query_var) {
                    sql = sql.replace('?', query_var[i]);
                }

                console.log(sql);
            }

            if(query_var) {
                connection.query(query_str, query_var, function (err, rows, fields) {
                    if (err) {
                        console.log('DATABASE ERROR.');
                        console.log(err);

                        reject({
                            hasError: 1,
                            sql: err.sqlMessage
                        });
                    }

                    resolve(rows);
                });


            } else {
                connection.query(query_str, function (err, rows, fields) {
                    if (err) {
                        // console.log('DATABASE ERROR.');
                        console.log('DATABASE ERROR: ' + err.sqlMessage);
                        // console.log(err.sqlMessage);

                        // console.log(err);
                        reject({
                            hasError: 1,
                            sql: err.sqlMessage
                        });
                    }

                    resolve(rows);
                });
            }
        });
    }

    function queryLocal (query_str, query_var) {
        return new Promise(function(resolve, reject) {
            var connection = getLocalMySQL_connection();

            if(query_var) {
                connection.query(query_str, query_var, function (err, rows, fields) {
                    if (err) {
                        console.log('DATABASE ERROR.');
                        console.log(err);
                        return reject(err);
                    }
                    resolve(rows);
                });
            } else {
                connection.query(query_str, function (err, rows, fields) {
                    if (err) {
                        console.log('DATABASE ERROR.');
                        console.log(err);

                        console.log(err);
                        return reject(err);
                    }
                    resolve(rows);
                });
            }
        });
    }

    /**
     * Pagination functions below.
     */

    function getCount (sql, sql_args, page, row_limit, page_limit) {
        
        var args = {
            sql: sql,
            sql_args: sql_args,
            page: parseInt(page),
            row_limit: parseInt(row_limit),
            page_limit: parseInt(page_limit)
        };
        
        return function (callback) {
            var sql_count = "SELECT COUNT(*) as count FROM (" + sql + ") as A";

            // Add arguments if present.
            if (sql_args) {
                query(sql_count, sql_args).then(function (response) {
                    args['count'] = response[0].count;
                    args['total_pages'] = Math.ceil(response[0].count / args['row_limit']);

                    callback(null, args);
                }).catch(function (error) {
                    callback(null, error);
                });
            } else {
                query(sql_count).then(function (response) {
                    args['count'] = response[0].count;
                    
                    args['total_pages'] = Math.ceil(response[0].count / args['row_limit']);

                    callback(null, args);
                }).catch(function (error) {
                    callback(null, error);
                });
            }
        }
    }

    function getPageDetails (args, callback) {
        var page = args.page,
            pages = [],
            page_start = 1,
            page_end = args.page_limit,
            page_limit = args.page_limit,
            total_pages = args.total_pages;

        /**
         * Do adjustments.
         */
        
        if (page > total_pages) {
            args.page = 1;
            page = 1;
        }

        var limit = (args.row_limit > args.count) ? args.count : args.row_limit,
            offset = (page - 1) * args.count / (args.count / args.row_limit);

        while (!(page >= 0 && page <= page_end)) {
            page_start = page_start + page_limit;
            page_end = page_end + page_limit;
        }

        for (var i = page_start; i <= page_end; i++) {
            if (i <= total_pages) {
                pages.push(i);
            } else {
                // If it exceeds, then clearly there are still something below.
                var previous_page = pages[0] - 1;

                if (previous_page > 1) {
                    pages.unshift(previous_page);
                }
            }
        }

        args['limit'] = limit;
        args['offset'] = offset;
        args['pages'] = pages;
        args['page_start'] = page_start;
        args['page_end'] = page_end;
        args['entries_per_page'] = ''; // Row limit

        callback(null, args);
    }

    function getQueryResults (args, callback) {
        if (args.count !== 0) {
            var sql = "SELECT * FROM (" + args.sql + " ) as A LIMIT " + args.limit + " OFFSET " + args.offset;

            if (args.sql_args) {
                query(sql, args.sql_args).then(function (response) {
                    callback(null, {
                        data: response,
                        pagination_data: {
                            current_page: args.page,
                            total_pages: args.total_pages,
                            display_pages: args.pages,
                        }
                    });
                });
            } else {
                query(sql).then(function (response) {
                    callback(null, response);
                });
            }
        } else {
            callback(null, []);
        }   
    }

    return {
        /**
         * First param is the query, 2nd is the array to map using a prepared statement.
         * If 2nd param is empty it will just process the query directly. (careful when using this)
         * @param query_str
         * @param query_var
         * @returns {*}
         */
        queryTransaction: queryTransaction,
        getMySQL_connection: getMySQL_connection,
        query: query,
        queryLocal: queryLocal,
        getPaginatedQuery: function (sql, sql_args, page, row_limit, page_limit) {
            return new Promise(function (resolve, reject) {
                async.waterfall([
                    getCount(sql, sql_args, page, row_limit, page_limit),
                    getPageDetails,
                    getQueryResults
                ], function (err, results) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }); 
            });
        },
        getPromisifiedQuery: function (connection) {
            return function (stmt, args, showQuery) {
                return new Promise((resolve, reject) => {

                    if (showQuery) {
                        let sql = stmt;

                        for (let i in args) {
                            sql = sql.replace('?', args[i]);
                        }

                        console.log(sql);
                    }

                    connection.query(stmt, args, (err, rows, fields) => {
                        if (err) {
                            reject({
                                hasError: 1,
                                sql: err.sqlMessage
                            });
                        } else {
                            resolve(rows);
                        }
                    });
                });
            }
        },
        Transaction: class {
            constructor() {
                this.transactions = [];
            }

            // Setter.
            addTransaction(transactionDetails) {
                this.transactions.push(transactionDetails);
            }

            executeTransaction() {
                const queries = this.transactions;

                const connection = getMySQL_connection();

                // Begin transaction.
                const transaction = (resolve, reject) => connection.beginTransaction(() => {
                    let queryPromises = [];
                    let queryResults = [];

                    for (let i in queries) {
                        const stmt = queries[i].stmt;
                        const args = queries[i].args;

                        // Enclose in a function because "Promise-Waterfall" lib requires it.
                        let queryPromise = () => (new Promise((resolve, reject) => {
                            connection.query(stmt, args, (err, rows, fields) => {
                                if (err) {
                                    queryResults.push({
                                        sql: stmt,
                                        result: 'failed'
                                    });

                                    reject(err);
                                } else {
                                    queryResults.push({
                                        sql: stmt,
                                        result: 'passed'
                                    });

                                    resolve(rows);
                                }
                            });
                        }));

                        queryPromises.push(queryPromise);
                    }

                    PromiseWaterfall(queryPromises)
                        .then(res => {
                            connection.commit(err => {
                                if (err)
                                    connection.rollback();

                                resolve(res);
                            });
                        })
                        .catch(err => {
                            console.log('Rollback inducing error');
                            console.log(err);
                            connection.rollback(() => {
                                console.log('Execute Rollback.');
                                reject();
                            })
                        });
                });

                return new Promise((resolve, reject) => {
                    transaction(resolve, reject);
                });
            }

        },
        buildTransactionFragment: function (sql, args) {
            return { stmt: sql, args: args };
        },
        queryPaginate: function (sql, sql_args, page, row_limit, page_limit) {
            return new Promise(function (resolve, reject) {
                async.waterfall([
                    getCount(sql, sql_args, page, row_limit, page_limit),
                    getPageDetails,
                    getQueryResults
                ], function (err, results) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }); 
            });
        },
        /**
         * Promise method to check if a table exist or not.
         * @param table_name
         * @returns {*}
         */
        checkTable: function (table_name) {
            return new Promise(function (resolve, reject) {
                query('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?', [process.env.DB_DATABASE, table_name]).then(function (response) {
                    resolve(response[0].count);
                }).catch(function (err) {
                    throw err;
                });
            });
        },
        /**
         * Checks the template if already existing by checking it's image.
         * @param  {[type]} img [description]
         * @return {[type]}              [description]
         */
        checkTemplate: function (name) {
            return new Promise(function (resolve, reject) {
                query('SELECT COUNT(id) as count FROM `email_templates` WHERE name = ?', [name]).then(function (response) {
                    resolve(response[0].count);
                }).catch(function (err) {
                    throw err;
                });
            });
        }
    }
})();

module.exports = DBService;