let express = require('express'),
    async = require('async'),
    _ = require('lodash'),
    moment = require('moment'),
    crypto = require('crypto'),
    db = require('../database/database'),
    transaction = require('../database/transaction'),
    Promise = require('promise');


const Service = (function () {

    /**
     * Internal functions.
     */

    async function getUserPropertiesByToken(token) {
        try {
            const sql = `
              SELECT
                a.id,
                a.firstname,
                a.lastname,
                a.user_type_id,
                a.management_company_id,
                b.name AS user_type,
                a.token_expiry,
                a.token_expiry < NOW() AS token_expired
              FROM
                user a
                  INNER JOIN user_type b
                ON 1 =1
                AND a.user_type_id = b.id
              WHERE 1 =1 
                AND token = ?
                AND is_active = 1
            `;

            const query = await db.query(sql, [token]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function updateUserToken (id, token, remember_me) {

        console.log('id, token, remember_me', id, token, remember_me);

        let token_expiry = moment();

        if (remember_me) {
            console.log('I will add 24 hours');
            token_expiry = token_expiry.add(24, 'hours');
        } else {
            console.log('I will add 12 hours');
            token_expiry = token_expiry.add(12, 'hours');
        }

        token_expiry = token_expiry.format('YYYY-MM-DD HH:mm:00');

        let sql = `
                UPDATE \`user\` 
                SET 
                    token = ?,
                    token_expiry = ?
                WHERE id = ?
            `;

        const updateFragment = transaction.buildTransactionFragment(sql, [token, token_expiry, id]);
        const historyFragment = transaction.getHistoryTransactionFragment(id, 'Logged In', 'User');

        try {
            await db.queryTransaction([updateFragment, historyFragment]);

            return true;
        } catch (err) {
            return err;
        }
    }

    async function authenticate (username, password) {

        let sql = `
                SELECT 
                  a.id,
                  a.firstname,
                  a.lastname,
                  b.name
                FROM
                  user a 
                INNER JOIN user_type b 
                  ON 1 = 1 
                  AND a.user_type_id = b.id
                WHERE 1 = 1
                  AND a.username = ?
                  AND a.password = ?  
            `;

        try {
            const query = await db.query(sql, [username, password]);

            if (_.isEmpty(query)) {
                return false;
            }

            return query;
        } catch (err) {
            console.log('err', err);
            return err;
        }
    }

    async function getUserByUserAndPass(username, password) {
        let sql = `
            SELECT 
                a.id,
                a.firstname,
                a.lastname,
                a.token,
                a.token_expiry,
                b.name,
                a.token_expiry < NOW() AS token_expired,
                NOW() as noww,
                a.management_company_id, 
                a.user_type_id,
                b.name as user_type
            FROM \`user\` a
            INNER JOIN user_type b 
                ON 1 = 1
                  AND a.user_type_id = b.id
            WHERE 1 = 1 
                AND a.username = ?
                AND a.password = ?
                AND a.is_active = 1
        `;

        const result = await db.query(sql, [username, password], 1);

        return  result;
    }

    async function getUserById(id) {
        let sql = `
            SELECT 
                a.id,
                a.firstname,
                a.lastname,
                a.token,
                a.token_expiry,
                b.name,
                a.token_expiry < NOW() AS token_expired,
                NOW() as noww,
                a.management_company_id,
                a.user_type_id
            FROM \`user\` a
            INNER JOIN user_type b 
                ON 1 = 1
                  AND a.user_type_id = b.id
            WHERE 1 = 1 
                AND a.id = ?
                AND a.is_active = 1
        `;

        const result = await db.query(sql, [id], 1);

        return  result;
    }
    function generateToken() {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(20, function (err, buffer) {
                let token = buffer.toString('hex');

                resolve(token);
            });
        });
    }



    return {
        authenticate: authenticate,
        generateToken: generateToken,
        getUserByUserAndPass: getUserByUserAndPass,
        updateUserToken: updateUserToken,
        getUserPropertiesByToken: getUserPropertiesByToken,
        getUserById: getUserById
    }
})();

module.exports = Service;