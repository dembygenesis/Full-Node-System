var express = require('express'),
    _ = require('lodash'),
    db = require('../database/database'),
    Utils = require('../../services/utils');

const Service = (function () {

    // Validation Methods.
    function validateUserType(userTypeId) {
        return ["1", "2", "3"].indexOf(userTypeId) !== -1;
    }

    async function addCustomer(companyId) {
        try {
            const sql = `
                INSERT INTO customer (
                    next_invoice_date,
                    company_id
                  )
                  VALUES
                  (
                    DATE_ADD(NOW(), INTERVAL 3 MONTH) ,
                    ?
                  ) ;
            `;

            const query = await db.query(sql, [companyId]);
            return query;
        } catch (err) {
            return err;
        }
    }

    // CRUD methods.
    async function addCompany(name,
                              acn_vcn,
                              mobile_number,
                              telephone_number,
                              created_by,
                              billing_street_number,
                              billing_street_name,
                              billing_suburb,
                              billing_post_code,
                              contact_name,
                              email,
                              purchase_order_number,) {
        try {
            const sql = `
                INSERT INTO company (
                    \`name\`,
                    acn_vcn,
                    mobile_number,
                    telephone_number,
                    created_by,
                    
                    billing_street_number,
                    billing_street_name,
                    billing_suburb,
                    billing_post_code,
                    
                    contact_name,
                    email,
                    purchase_order_number
                  )
                  VALUES
                  (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                  ) ;
            `;

            const query = await db.query(sql, [
                name,
                acn_vcn,
                mobile_number,
                telephone_number,
                created_by,

                billing_street_number,
                billing_street_name,
                billing_suburb,
                billing_post_code,

                contact_name,
                email,
                purchase_order_number,
            ]);


            return query;
        } catch (err) {
            return err;
        }
    }

    function checkCompanyName(req, res, next) {
        req.assert('username', 'must be unique').notEmpty().hasNoEntries('company', 'company', req.param('username'));

        req.asyncValidationErrors().then(function () {
            console.log('pass!');

            next();
        }).catch(function (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        });
    }

    async function updateCompanyCreditCardToken(companyId, token, expiredMonth, expiredYear) {
        try {
            const sql = `
              UPDATE
                company
              SET 
                  qb_credit_card_token = ?,
                  credit_card_expired_month = ?,
                  credit_card_expired_year = ?,
                  last_updated     = NOW()
              WHERE id = ?
            `;

            const query = await db.query(sql, [
                token,
                expiredMonth,
                expiredYear,
                companyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function saveCreditCard(companyId,
                                  cardCode,
                                  cardNumber,
                                  selectedMonth,
                                  selectedYear,
                                  billing_street_number,
                                  billing_street_name,
                                  billing_suburb,
                                  billing_post_code,
                                  contact_name) {

        const request = require('request');

        const headers = {
            'Content-Type': 'application/json'
        };
        const data = {
            "card": {
                "expYear": selectedYear,
                "expMonth": selectedMonth < 9 ? "0" + Number(selectedMonth) : selectedMonth,
                "address": {
                    "region": billing_suburb,
                    "postalCode": billing_post_code,
                    "streetAddress": billing_street_number,
                    "country": "AU",
                    "city": billing_suburb
                },
                "name": contact_name,
                "cvc": cardCode,
                "number": cardNumber
            }
        }

        return new Promise((resolve, reject) => {
            request({
                headers: headers,
                uri: `https://api.intuit.com/quickbooks/v4/payments/tokens`,
                method: 'POST',
                json: data
            }, function (err, ress, body) {
                if (body.Fault && body.Fault.Error) {
                    reject(JSON.stringify(body.Fault.Error));
                }
                console.log(body)
                resolve(body);
            });
        });
    }

    async function updateCompany(companyId,
                                 companyName,
                                 acnVcn,
                                 mobileNumber,
                                 telephoneNumber,
                                 billing_street_number,
                                 billing_street_name,
                                 billing_suburb,
                                 billing_post_code,
                                 contact_name,
                                 email,
                                 purchase_order_number,
                                 userId,) {
        try {
            const sql = `
              UPDATE
                company
              SET \`name\`                         = ?,
                  acn_vcn                          = ?,
                  mobile_number                    = ?,
                  telephone_number                 = ?,
                                   
                  billing_street_number            = ?,
                  billing_street_name              = ?,
                  billing_suburb                   = ?,
                  billing_post_code                = ?,
                  
                  
                  contact_name                     = ?,
                  email                            = ?,
                  purchase_order_number            = ?,
                  updated_by                       = ?,
                  last_updated     = NOW()
              WHERE id = ?
            `;

            const query = await db.query(sql, [
                companyName,
                acnVcn,
                mobileNumber,
                telephoneNumber,

                billing_street_number,
                billing_street_name,
                billing_suburb,
                billing_post_code,

                contact_name,
                email,
                purchase_order_number,
                userId,
                companyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function voidCompanyById(companyId, userId) {

        try {
            const sql = `
              UPDATE
                company
              SET is_active        = 0,
                  updated_by       = ?,
                  last_updated     = NOW()
              WHERE id = ?
            `;

            const query = await db.query(sql, [
                userId,
                companyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    /**
     * SELECT
     a.name,
     a.acn_vcn,
     a.mobile_number,
     a.telephone_number,
     CONCAT(b.lastname, ', ', b.firstname) AS created_by
     FROM
     company a
     INNER JOIN \`user`\ b
     ON 1 =1
     AND a.created_by = b.id
     AND a.created_by = 207
     */

    async function getCompanyByCreator(createdById) {

        try {
            const sql = `
              SELECT a.name,
                     a.acn_vcn,
                     a.mobile_number,
                     a.telephone_number,
                     CONCAT(b.lastname, ', ', b.firstname) AS created_by
              FROM company a
                     INNER JOIN \`user\` b
                                ON 1 = 1 AND a.created_by = b.id AND a.created_by = ?
            `;

            const query = await db.query(sql, [
                createdById
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    /*async function validateUserIds(userIds) {
        try {
            userIds = _.uniqBy(userIds.split(','));

            const userIdsSize = _.size(userIds);

            const userIdInjections = userIds.reduce((accumulator, value) => {
                accumulator = accumulator + value + ',';

                return accumulator, accumulator;
            }, '').slice(0, -1);

            const sql = `
                SELECT COUNT(*) AS userCount FROM \`user\` 
                WHERE id IN (${userIdInjections})
            `;

            // Change also here. Check count BUT also check the user types.

            const result = await db.query(sql, [userIdInjections]);
            const userIdCount = parseFloat(result[0]['userCount']);

            return userIdCount === userIdsSize;
        } catch (errors) {
            return false;
        }
    }*/

    async function validateUserIds(userIds, validUserTypes) {
        try {
            userIds = _.uniqBy(userIds.split(','));

            const userIdsSize = _.size(userIds);

            const userIdInjections = userIds.reduce((accumulator, value) => {
                accumulator = accumulator + value + ',';

                return accumulator, accumulator;
            }, '').slice(0, -1);

            const sql = `
                SELECT 
                      b.name AS user_type 
                FROM \`user\` a
                INNER JOIN user_type b 
                  ON 1 = 1 
                  AND a.user_type_id = b.id
                WHERE a.id IN (${userIdInjections})
                  AND a.is_active = 1
            `;

            const result = await db.query(sql);

            // Count via loop BUT get the accounts types.
            let allValidUserIds = true;

            for (let i in result) {
                const userType = result[i]['user_type'];

                if (validUserTypes.indexOf(userType) === -1) {
                    allValidUserIds = false;
                }
            }

            return _.size(result) === userIdsSize && allValidUserIds;
        } catch (errors) {
            console.log(errors);
            return false;
        }
    }

    async function validateUserIdsCreatedByClient(clientId, userIds) {
        try {
            userIds = _.uniqBy(userIds.split(','));

            const userIdsSize = _.size(userIds);

            const userIdInjections = userIds.reduce((accumulator, value) => {
                accumulator = accumulator + value + ',';

                return accumulator, accumulator;
            }, '').slice(0, -1);

            const sql = `
                SELECT COUNT(*) AS userCount FROM \`user\` 
                WHERE 1 = 1 
                  AND id IN (${userIdInjections})
                  AND created_by = ${clientId}
            `;

            const result = await db.query(sql, [userIdInjections]);
            const userIdCount = parseFloat(result[0]['userCount']);

            return userIdCount === userIdsSize;
        } catch (errors) {
            return false;
        }
    }

    async function validateUserIdsHasSameManagementCompanyAsClient(managementCompanyId, userIds) {
        try {
            userIds = _.uniqBy(userIds.split(','));

            const userIdsSize = _.size(userIds);

            const userIdInjections = userIds.reduce((accumulator, value) => {
                accumulator = accumulator + value + ',';

                return accumulator, accumulator;
            }, '').slice(0, -1);

            const sql = `
                SELECT COUNT(*) AS userCount FROM \`user\` 
                WHERE 1 = 1   
                  AND is_active = 1
                  AND id IN (${userIdInjections})
                  AND management_company_id = ${managementCompanyId}
            `;

            const result = await db.query(sql, [managementCompanyId]);
            const userIdCount = parseFloat(result[0]['userCount']);

            return userIdCount === userIdsSize;
        } catch (errors) {
            return false;
        }
    }

    async function getCompanyByCreatorAndId(creatorId, companyId) {
        try {
            const sql = `
              SELECT COUNT(*) AS company_count
              FROM company a
              WHERE 1 = 1
                AND a.created_by = ?
                AND a.id = ?
            `;

            const query = await db.query(sql, [
                creatorId,
                companyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getAssignedCompaniesByCreatorAndId(creatorId, companyId, userType) {
        try {
            let sql = '';

            if (userType === 'Administrator' || userType === 'Account Holder') {
                sql = `
                  SELECT COUNT(*) AS company_count
                  FROM (SELECT b.\`id\`,
                               b.\`name\`
                        FROM \`account_holder_assigned_company\` a
                               INNER JOIN company b
                                          ON 1 = 1
                                            AND a.\`company_id\` = b.\`id\`
                        WHERE 1 = 1
                          AND a.\`user_id_assignee\` = ?
                          AND a.is_active = 1
                          AND b.is_active = 1
                          AND a.\`company_id\` = ?) AS a
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT COUNT(*) AS company_count
                  FROM (SELECT b.\`id\`,
                               b.\`name\`
                        FROM \`reviewer_assigned_company\` a
                               INNER JOIN company b
                                          ON 1 = 1
                                            AND a.\`company_id\` = b.\`id\`
                        WHERE 1 = 1
                          AND a.\`user_id_assignee\` = ?
                          AND a.is_active = 1
                          AND b.is_active = 1
                          AND a.\`company_id\` = ?) AS a
                `;
            }

            if (userType === 'Compliance Certifier') {
                sql = `
                  SELECT 
                    COUNT(DISTINCT (e.id)) AS company_count
                  FROM compliance_contributor_assigned_measures a
                         INNER JOIN compliance b
                                    ON 1 = 1
                                      AND a.compliance_id = b.id
                         INNER JOIN \`space\` c
                                    ON 1 = 1
                                      AND b.space_id = c.id
                         INNER JOIN location d
                                    ON 1 = 1
                                      AND c.location_id = d.id
                         INNER JOIN company e
                                    ON 1 = 1
                                      AND d.company_id = e.id
                  WHERE 1 = 1
                    AND a.user_id = ?
                    AND a.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND e.is_active = 1
                    AND d.payment_status != 'Suspended'
                    AND d.company_id = ?
                `;
            }

            if (userType === 'Manager') {
                sql = `
                  SELECT COUNT(*) AS company_count
                  FROM (SELECT b.\`id\`,
                               b.\`name\`
                        FROM \`manager_assigned_location\` a
                               INNER JOIN location c
                                          ON 1 = 1
                                            AND a.\`location_id\` = c.\`id\`
                               INNER JOIN company b
                                          ON 1 = 1
                                            AND c.\`company_id\` = b.\`id\`
                        WHERE 1 = 1
                          AND a.\`user_id_assignee\` = ?
                          AND a.is_active = 1
                          AND c.is_active = 1
                          AND b.is_active = 1
                          AND c.payment_status != 'Suspended'
                          AND b.\`id\` = ?) AS a
                `;


            }

            const query = await db.query(sql, [
                creatorId,
                companyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getCreatedOrAssignedCompaniesByCreatorAndId(creatorId, companyId, userType) {
        try {

            let sql = '';

            if (userType === 'Manager') {
                sql = `
                  SELECT COUNT(*) AS company_count
                        FROM \`manager_assigned_location\` a
                               INNER JOIN location c
                                          ON 1 = 1
                                            AND a.\`location_id\` = c.\`id\`
                               INNER JOIN company b
                                          ON 1 = 1
                                            AND c.\`company_id\` = b.\`id\`
                        WHERE 1 = 1
                          AND a.\`user_id_assignee\` = ?
                          AND c.\`company_id\` = ?
                          AND c.payment_status != 'Suspended'
                          AND a.is_active = 1
                          AND b.is_active = 1
                          AND c.is_active = 1
                `;
            }

            if (userType === 'Administrator' || userType === 'Account Holder') {
                sql = `
                  SELECT COUNT(*) AS company_count
                  FROM (SELECT b.\`id\`,
                               b.\`name\`
                        FROM \`account_holder_assigned_company\` a
                               INNER JOIN company b
                                          ON 1 = 1
                                            AND a.\`company_id\` = b.\`id\`
                        WHERE 1 = 1
                          AND a.\`user_id_assignee\` = ?
                          AND a.is_active = 1
                          AND b.is_active = 1
                          AND a.\`company_id\` = ?) AS a
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT COUNT(*) AS company_count
                  FROM (SELECT b.\`id\`,
                               b.\`name\`
                        FROM \`reviewer_assigned_company\` a
                               INNER JOIN company b
                                          ON 1 = 1
                                            AND a.\`company_id\` = b.\`id\`
                        WHERE 1 = 1
                          AND a.\`user_id_assignee\` = ?
                          AND a.is_active = 1
                          AND b.is_active = 1
                          AND a.\`company_id\` = ?) AS a
                `;
            }

            if (userType === 'Compliance Certifier') {
                sql = `
                  SELECT 
                    COUNT(DISTINCT(d.company_id)) AS company_count
                  FROM compliance_contributor_assigned_measures a
                         INNER JOIN compliance b
                                    ON 1 = 1
                                      AND a.compliance_id = b.id
                         INNER JOIN \`space\` c
                                    ON 1 = 1
                                      AND b.space_id = c.id
                         INNER JOIN location d
                                    ON 1 = 1
                                      AND c.location_id = d.id
                  WHERE 1 = 1
                    AND a.user_id = ?
                    AND d.company_id = ?
                    AND a.is_active = 1
                    AND d.is_active = 1
                    AND c.is_active = 1
                    AND d.payment_status != 'Suspended'
                `;
            }

            const query = await db.query(sql, [
                creatorId,
                companyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function addCompanyToUsers(clientId, userIds, companyId) {

        try {
            let sqlValues = '';

            userIds = userIds.split(',');

            for (let i in userIds) {
                const userId = userIds[i];
                if (userId)
                    sqlValues = sqlValues + `(${clientId}, ${userId}, ${companyId}),`;
            }

            sqlValues = sqlValues.slice(0, -1);

            let sql = `
              INSERT INTO account_holder_assigned_company (
                 user_id,
                 user_id_assignee,
                 company_id
               ) 
               VALUES ${sqlValues}
            `;

            const result = await db.query(sql);

            return result;

        } catch (errors) {
            return errors;
        }
    }

    async function addCompanyToReviewers(clientId, userIds, companyId) {

        try {
            let sqlValues = '';

            userIds = userIds.split(',');

            for (let i in userIds) {
                const userId = userIds[i];

                sqlValues = sqlValues + `(${clientId}, ${userId}, ${companyId}),`;
            }

            sqlValues = sqlValues.slice(0, -1);

            let sql = `
              INSERT INTO reviewer_assigned_company (
                 user_id,
                 user_id_assignee,
                 company_id
               ) 
               VALUES ${sqlValues}
            `;

            const result = await db.query(sql);

            return result;

        } catch (errors) {
            return errors;
        }
    }

    async function revokeCompanyFromUsers(clientId, userIds, companyId) {

        // CREATE INDEX user_id_assignee_company_id_idx ON `account_holder_assigned_company` (user_id_assignee, company_id)
        try {
            let sqlValues = '';

            userIds = userIds.split(',');

            for (let i in userIds) {
                const userId = userIds[i];

                // sqlValues = sqlValues + `(user_id = ${clientId} AND user_id_assignee = ${userId} AND company_id = ${companyId}) OR`;
                sqlValues = sqlValues + `(user_id_assignee = ${userId} AND company_id = ${companyId}) OR`;
            }

            sqlValues = sqlValues.slice(0, -2);

            /*let sql = `
              DELETE FROM account_holder_assigned_company
               WHERE ${sqlValues}
            `;*/

            let sql = `
              UPDATE account_holder_assigned_company
                SET is_active = 0,
                    updated_by = ?
              WHERE ${sqlValues}
            `;

            console.log(sql);

            const result = await db.query(sql, [clientId]);

            return result;

        } catch (errors) {
            return errors;
        }
    }

    async function revokeCompanyFromReviewers(clientId, userIds, companyId) {

        try {
            let sqlValues = '';

            userIds = userIds.split(',');

            for (let i in userIds) {
                const userId = userIds[i];

                sqlValues = sqlValues + `(user_id_assignee = ${userId} AND company_id = ${companyId}) OR`;
            }

            sqlValues = sqlValues.slice(0, -2);

            /*let sql = `
              DELETE FROM reviewer_assigned_company
               WHERE ${sqlValues}
            `;*/

            let sql = `
              UPDATE reviewer_assigned_company
                SET is_active = 0,
                    last_updated = NOW(),
                    updated_by = ?
              WHERE ${sqlValues}
            `;

            console.log(sql);

            const result = await db.query(sql, [clientId]);

            return result;

        } catch (errors) {
            return errors;
        }
    }

    async function getCreatedAndPrivilegedCompanies(userId) {
        const sql = `
          SELECT *
          FROM (
                 (SELECT a.company_id                                             AS id,
                         c.\`name\`,
                         c.\`acn_vcn\`,
                         c.\`mobile_number\`,
                         c.\`telephone_number\`,
                         CONCAT(b.\`lastname\`, ', ', b.\`firstname\`)            AS creator,
                         IF(c.created_by = a.user_id_assignee, 'Own', 'Assigned') AS \`type\`
                  FROM account_holder_assigned_company a
                         INNER JOIN \`user\` b
                                    ON 1 = 1
                                      AND a.\`user_id\` = b.\`id\`
                         INNER JOIN company c
                                    ON 1 = 1
                                      AND a.\`company_id\` = c.\`id\`
                  WHERE 1 = 1
                    AND a.\`user_id_assignee\` = ?)
               ) AS a
        `;

        try {
            const result = await db.query(sql, [userId, userId]);

            return result;
        } catch (errors) {
            return errors;
        }
    }

    async function getCreatedAndPrivilegedCompaniesByCompanyId(managementCompanyId, companyId) {

        const sql = `
          SELECT a.id                                                     AS user_id,
                 b.name                                                   AS user_type,
                 CONCAT(a.lastname, ', ', a.firstname)                    AS \`name\`,
                 IF(c.user_id_assignee IS NULL, 'Unassigned', 'Assigned') AS \`type\`
          FROM \`user\` a
                 INNER JOIN user_type b
                            ON 1 = 1
                              AND a.user_type_id = b.id
                 LEFT JOIN account_holder_assigned_company c
                           ON 1 = 1
                             AND a.id = c.user_id_assignee
                             AND c.company_id = ?
                             AND c.is_active = 1
          WHERE (b.name = 'Administrator' OR b.name = 'Account Holder')
            AND a.management_company_id = ?
            AND a.is_active = 1
          GROUP BY a.id
        `;

        try {
            const result = await db.query(sql, [
                companyId,
                managementCompanyId,
            ]);

            return result;
        } catch (errors) {
            return errors;
        }
    }

    async function getReviewerCreatedAndPrivilegedCompaniesByCompanyId(managementCompanyId, companyId) {

        const sql = `
          SELECT a.id                                                     AS user_id,
                 b.name                                                   AS user_type,
                 CONCAT(a.lastname, ', ', a.firstname)                    AS \`name\`,
                 IF(c.user_id_assignee IS NULL, 'Unassigned', 'Assigned') AS \`type\`
          FROM \`user\` a
                 INNER JOIN user_type b
                            ON 1 = 1
                              AND a.user_type_id = b.id
                 LEFT JOIN reviewer_assigned_company c
                           ON 1 = 1
                             AND a.id = c.user_id_assignee
                             AND c.company_id = ?
                             AND c.is_active = 1
          WHERE b.name = 'Reviewer'
            AND a.management_company_id = ?
            AND a.is_active = 1
          GROUP BY a.id
        `;

        try {
            const result = await db.query(sql, [
                companyId,
                managementCompanyId,
            ]);

            return result;
        } catch (errors) {
            return errors;
        }
    }

    async function getCompanyById(companyId) {
        try {
            const sql = `
              SELECT *
              FROM company
              WHERE id = ?
                AND is_active = 1
            `;

            const query = await db.query(sql, [
                companyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getAccountTypeAccessAssignmentRules(userId, userIds, companyId, userType) {

        // I must know if that company I'm handling is assigned to me, or if I am it's creator.
        // I must know if the users I am assigning to ARE administors OR account holders
        // I don't need to worry myself IF these userIDS are actually my own created ones.. I have a previous
        // validator for that. ok!

        userIds = _.uniqBy(userIds.split(','));

        const userIdsSize = _.size(userIds);

        const userIdInjections = userIds.reduce((accumulator, value) => {
            accumulator = accumulator + value + ',';

            return accumulator, accumulator;
        }, '').slice(0, -1);

        // Check company if assigned.
        const companyTypeSql = `
          SELECT a.type
          FROM (
                 (SELECT a.id,
                         a.\`name\`,
                         a.\`acn_vcn\`,
                         a.\`mobile_number\`,
                         a.\`telephone_number\`,
                         'Self' AS creator,
                         'Own'  AS \`type\`
                  FROM company a
                  WHERE 1 = 1
                    AND a.id = '${companyId}'
                    AND a.\`created_by\` IN (${userId}))
                 UNION
                   ALL
                 (SELECT a.company_id                                  AS id,
                         c.\`name\`,
                         c.\`acn_vcn\`,
                         c.\`mobile_number\`,
                         c.\`telephone_number\`,
                         CONCAT(b.\`lastname\`, ', ', b.\`firstname\`) AS creator,
                         'Assigned'                                    AS \`type\`
                  FROM account_holder_assigned_company a
                         INNER JOIN \`user\` b
                                    ON 1 = 1
                                      AND a.\`user_id\` = b.\`id\`
                         INNER JOIN company c
                                    ON 1 = 1
                                      AND a.\`company_id\` = c.\`id\`
                  WHERE 1 = 1
                    AND a.company_id = ${companyId}
                    AND a.\`user_id_assignee\` IN (${userId}))
               ) AS a
        `;

        const companyType = (await db.query(companyTypeSql, [
            companyId,
            userId,
            companyId,
            userId,
        ]))[0]['type'];

        // Check roles of people that you are ASSIGNING TO.
        const userAssignedToRolesSql = `
            SELECT 
                   GROUP_CONCAT(DISTINCT(b.name)) AS user_types
            FROM \`user\` a 
            INNER JOIN user_type b 
              ON 1 = 1 
              AND a.user_type_id = b.id
            WHERE 1 = 1
              AND a.id IN (${userIdInjections})
            
        `;

        const userAssignedToRoles = (await db.query(userAssignedToRolesSql, [
            companyId,
            userId,
            companyId,
            userId,
        ]))[0]['user_types'];

        console.log('userAssignedToRoles', userAssignedToRoles);

        // If it's assigned and some of the people you are assigning to are account holders - Stop it.
    }

    async function getAccountHolderCompanies(managementCompanyId) {
        try {
            const sql = `
              SELECT c.id,
                     c.name,
                     c.acn_vcn,
                     c.mobile_number,
                     c.telephone_number,
                     
                     CONCAT(
                        c.billing_street_number, ' ',
                        c.billing_street_name, ' ',
                        c.billing_suburb, ' ',
                        c.billing_post_code, ' '
                     ) AS billing_address,
                     
                     c.contact_name,
                     c.email,
                     c.purchase_order_number,
                     
                     CONCAT(b.lastname, ', ', b.firstname)            AS creator,
                     c.qb_credit_card_token
              FROM \`user\` b
                     INNER JOIN company c
                                ON 1 = 1
                                  AND b.id = c.created_by
                     INNER JOIN management_company d
                                ON 1 = 1
                                  AND b.management_company_id = d.id
              WHERE 1 = 1
                AND b.management_company_id = ?
                AND c.is_active = 1
            `;

            const query = await db.query(sql, [
                managementCompanyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function companyMustBeInSimilarManagementCompany(companyId, managementCompanyId) {
        try {
            // Logic is.. Get ALL companies under your management company.
            const sql = `
              SELECT COUNT(*) AS company_count FROM company a 
              INNER JOIN \`user\` b 
                ON 1 = 1
                AND a.created_by = b.id 
              INNER JOIN management_company c 
                ON 1 = 1
                AND b.management_company_id = c.id
              WHERE 1 = 1 
                AND a.id = ?
                AND c.id = ?
                AND a.is_active = 1
                AND b.is_active = 1
            `;

            const query = await db.query(sql, [
                companyId,
                managementCompanyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function checkCompanyManagementCompanyId(companyId, managementCompanyId) {

        try {
            const sql = `
              SELECT COUNT(*) AS company_count
              FROM company a
              INNER JOIN location b 
                ON 1 =1 
                AND b.company_id = a.id 
              INNER JOIN 
              WHERE 1 = 1
                AND a.id = ?
                AND a.id = ?
                AND b.payment_status != 'Suspended'
            `;

            const query = await db.query(sql, [
                companyId,
                managementCompanyId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function assignedAccountHolderCompanyHasNoCurrentActive(userIds, companyId) {

        try {
            let sqlValues = '';

            userIds = userIds.split(',');

            for (let i in userIds) {
                const userId = userIds[i];

                sqlValues = sqlValues + `(user_id_assignee = ${userId} AND company_id = ${companyId} AND is_active = 1) OR`;
            }

            sqlValues = sqlValues.slice(0, -2);

            let sql = `
              SELECT 
                     COUNT(*) AS assigned_company_count 
              FROM account_holder_assigned_company
               WHERE ${sqlValues}
            `;

            const count = parseFloat((await db.query(sql))[0]['assigned_company_count']);

            return count === 0;
        } catch (errors) {
            return errors;
        }
    }

    async function assignedReviewerCompanyHasNoCurrentActive(userIds, companyId) {

        try {
            let sqlValues = '';

            userIds = userIds.split(',');

            for (let i in userIds) {
                const userId = userIds[i];

                sqlValues = sqlValues + `(user_id_assignee = ${userId} AND company_id = ${companyId} AND is_active = 1) OR`;
            }

            sqlValues = sqlValues.slice(0, -2);

            let sql = `
              SELECT 
                     COUNT(*) AS assigned_company_count 
              FROM reviewer_assigned_company
               WHERE ${sqlValues}
            `;

            const count = parseFloat((await db.query(sql))[0]['assigned_company_count']);

            return count === 0;
        } catch (errors) {
            return errors;
        }
    }

    async function hasNoDependencies(companyId) {

        try {
            // Ensure company has no active locations.
            const sql = `
              SELECT 
                location.name 
              FROM company 
              
              INNER JOIN location a
                ON 1 = 1
                  AND company.id = location.company_id
                  AND location.is_active = 1
                  AND location.payment_status != 'Suspended'

              WHERE 1 = 1
                AND company.id = ?
            `;

            return await db.query(sql, [companyId]);
        } catch (err) {
            return err;
        }
    }

    async function companyHasNoDuplicates(companyName, managementCompanyId, companyId) {
        try {
            let sql = `
                SELECT 
                    COUNT(*) AS company_count
                FROM company a 
            
                INNER JOIN \`user\` b 
                    ON 1 = 1
                    AND a.created_by = b.id
                    AND b.management_company_id = ?
            
                WHERE 1 = 1
                    AND a.name = ?
                    AND a.is_active = 1
            `;

            // IF there is a company id passed, assume this is edit and exclude checking your own name.
            if (companyId) {
                sql = `
                    SELECT 
                        COUNT(*) AS company_count
                    FROM company a 
                
                    INNER JOIN \`user\` b 
                        ON 1 = 1
                        AND a.created_by = b.id
                        AND b.management_company_id = ?
                
                    WHERE 1 = 1
                        AND a.name = ?
                        AND a.is_active = 1
                        AND a.id != ?
                `;
            }

            let result = await db.query(sql, [managementCompanyId, companyName]);

            return parseFloat(result[0]['company_count']) === 0;
        } catch (e) {

        }
    }

    return {
        companyHasNoDuplicates: companyHasNoDuplicates,
        hasNoDependencies: hasNoDependencies,
        assignedAccountHolderCompanyHasNoCurrentActive: assignedAccountHolderCompanyHasNoCurrentActive,
        assignedReviewerCompanyHasNoCurrentActive: assignedReviewerCompanyHasNoCurrentActive,
        companyMustBeInSimilarManagementCompany: companyMustBeInSimilarManagementCompany,
        getAccountTypeAccessAssignmentRules: getAccountTypeAccessAssignmentRules,
        getCreatedAndPrivilegedCompaniesByCompanyId: getCreatedAndPrivilegedCompaniesByCompanyId,
        getReviewerCreatedAndPrivilegedCompaniesByCompanyId: getReviewerCreatedAndPrivilegedCompaniesByCompanyId,
        getCreatedAndPrivilegedCompanies: getCreatedAndPrivilegedCompanies,
        getAccountHolderCompanies: getAccountHolderCompanies,
        revokeCompanyFromUsers: revokeCompanyFromUsers,
        revokeCompanyFromReviewers: revokeCompanyFromReviewers,
        addCompanyToUsers: addCompanyToUsers,
        addCompanyToReviewers: addCompanyToReviewers,
        getCompanyByCreatorAndId: getCompanyByCreatorAndId,
        validateUserIdsCreatedByClient: validateUserIdsCreatedByClient,
        validateUserIdsHasSameManagementCompanyAsClient: validateUserIdsHasSameManagementCompanyAsClient,
        validateUserIds: validateUserIds,
        getCompanyByCreator: getCompanyByCreator,
        validateUserType: validateUserType,
        getCompanyById: getCompanyById,
        addCompany: addCompany,
        updateCompany: updateCompany,
        saveCreditCard: saveCreditCard,
        updateCompanyCreditCardToken: updateCompanyCreditCardToken,
        voidCompanyById: voidCompanyById,
        checkCompanyName: checkCompanyName,
        getCreatedOrAssignedCompaniesByCreatorAndId: getCreatedOrAssignedCompaniesByCreatorAndId,
        getAssignedCompaniesByCreatorAndId: getAssignedCompaniesByCreatorAndId,
        addCustomer: addCustomer
    }

})();

module.exports = Service;