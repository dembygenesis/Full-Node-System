var express = require('express'),
    _ = require('lodash'),
    passwordGenerator = require('generate-password'),
    db = require('../database/database'),
    Utils = require('../../services/utils');

const Service = (function () {

    // Validation Methods.
    function validateUserType(userTypeId) {
        return ["1", "2", "3"].indexOf(userTypeId) !== -1;
    }


    // CRUD methods.
    async function addUser(id,
                           username,
                           firstname,
                           lastname,
                           email,
                           mobileNumber,
                           password,
                           user_type_id,
                           management_company_id) {
        try {
            const sql = `
                INSERT INTO \`user\` (
                  username,
                  firstname,
                  lastname,
                  email,
                  mobile_number,
                  \`password\`,
                  user_type_id,
                  management_company_id,
                  created_by
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
                    ?
                  ) ;
            `;

            const query = await db.query(sql, [
                username,
                firstname,
                lastname,
                email,
                mobileNumber,
                password,
                user_type_id,
                management_company_id,
                id
            ]);

            return query;
        } catch (errors) {
            console.log(errors);
            return errors;
        }
    }

    async function getUserTypeById(userTypeId) {
        const sql = `
            SELECT name FROM user_type WHERE id = ?
        `;

        try {
            const query = await db.query(sql, [userTypeId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    function getApproveUserPrivilegeRules(userType) {
        if (userType !== 'Super Administrator') {
            return {
                hasError: true,
                msg: 'Only Super Admin account can approve user'
            }
        }
        return true
    }
    function getUserPrivilegeRules(userType, userToBeCreatedType) {


        if (userToBeCreatedType === 'Super Administrator') {
            console.log('super admin');

            return {
                hasError: true,
                msg: 'You cannot %s Super Admin accounts.'
            }
        }

        if (userType === 'User') {
            return {
                hasError: true,
                msg: 'You cannot %s other accounts as account(s) type: "User".'
            }
        }

        if (userType === 'Account Holder') {

            if (userToBeCreatedType === 'User') {
                return {
                    hasError: true,
                    msg: 'You can only %s "Administrator" and "Account holder" accounts as account(s) type: "Account holder".'
                }
            }
        }

        if (userType === 'Administrator') {
            const inUserTypes = ['Administrator', 'Manager', 'Compliance Certifier', 'Reviewer'].indexOf(userToBeCreatedType) !== -1;

            if (inUserTypes === false) {
                return {
                    hasError: true,
                    msg: 'You can only %s "Administrator", "User", and "Compliance Certifier" accounts as account(s) type: "Administrator".'
                }
            }
        }

        return true;
    }

    // Throws an error if userType attempts to exceed his privileges when adding users.
    function getAddUserRules(userType, userToBeCreatedType) {

        const privilegesCheck = getUserPrivilegeRules(userType, userToBeCreatedType);

        if (privilegesCheck.hasError) {
            privilegesCheck.msg = privilegesCheck.msg.replace(/%s/g, 'add');
        }

        return privilegesCheck;
    }

    // Throws an error if userType attempts to exceed his privileges when adding users.
    function getVoidUserRules(userType, userToBeCreatedType) {

        const privilegesCheck = getUserPrivilegeRules(userType, userToBeCreatedType);

        if (privilegesCheck.hasError) {
            privilegesCheck.msg = privilegesCheck.msg.replace(/%s/g, 'void');
        }

        // Else proceed to check the \`user\` about to be voided if he is the one that created that account.


        return privilegesCheck;
    }
    function getApproveUserRules(userType, userToBeCreatedType) {

        const privilegesCheck = getApproveUserPrivilegeRules(userType, userToBeCreatedType);
        return privilegesCheck;
    }
    async function getUserById(userId) {
        const sql = `
            SELECT 
                * 
            FROM \`user\` 
            WHERE 1 = 1
                AND id = ?
                AND is_active = 1
        `;

        try {
            const query = await db.query(sql, [userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getUserCreatorByUserId(userId) {
        const sql = `
            SELECT id, created_by FROM \`user\` WHERE id = ?
        `;

        try {
            const query = await db.query(sql, [userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function voidUser(userId, updatedBy) {
        const sql = `
            UPDATE \`user\`
              SET is_active = 0,
                  last_updated = NOW(),
                  updated_by = ?
            WHERE 1 = 1 
             AND id = ?
        `;

        try {
            const query = await db.query(sql, [updatedBy, userId], 1);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    /**
     * =========================
     * View Queries
     * =========================
     */

    async function getManagementCompanies() {
        const sql = `
            SELECT id, \`name\` FROM management_company
        `;

        try {
            const query = await db.query(sql);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getAccountTypes(filters) {
        const sql = `
            SELECT id, \`name\` FROM user_type
        `;

        try {
            const query = await db.query(sql);

            if (filters) {
                // Filter arr.
            }

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getUserDetails(userId, managementCompanyId, userType) {
        const sql = `
              SELECT
                a.id,
                a.firstname,
                a.lastname,
                a.user_type_id,
                a.management_company_id,
                b.name AS user_type,
                a.username,
                a.email,
                a.mobile_number,
                '' AS \`password\`,
                a.token_expiry
              FROM
                \`user\` a
                  INNER JOIN user_type b
                ON 1 =1
                AND a.user_type_id = b.id
              WHERE 1 =1 
                AND a.id = ?
                AND ${userType !== "Super Administrator" ? " a.management_company_id = ? " : " 1 = 1"}
        `;

        // Disregard management company if super administrator.
        try {
            const query = await db.query(sql, [userId, managementCompanyId], 1);

            return query;
        } catch (errors) {
            return errors;
        }
    }


    async function getUser(userId, managementCompanyId, userType) {
        const sql = `
              SELECT
                a.id,
                a.firstname,
                a.lastname,
                a.user_type_id,
                a.management_company_id,
                b.name AS user_type,
                a.username,
                a.email,
                a.mobile_number,
                a.password,
                a.token_expiry
              FROM
                \`user\` a
                  INNER JOIN user_type b
                ON 1 =1
                AND a.user_type_id = b.id
              WHERE 1 =1 
                AND a.id = ?
                AND ${userType !== "Super Administrator" ? " a.management_company_id = ? " : " 1 = 1"}
        `;

        // Disregard management company if super administrator.
        try {
            const query = await db.query(sql, [userId, managementCompanyId], 1);

            return query;
        } catch (errors) {
            return errors;
        }
    }
    async function updateUser(userId, username, password, firstname, lastname, email, mobileNumber, updatedBy) {

        let sql = `
            UPDATE 
              \`user\` 
            SET
              username = ?,
              firstname = ?,
              lastname = ?,
              email = ?,
              mobile_number = ?,
              \`password\` = ?,
              updated_by = ?,
              last_updated     = NOW()
            WHERE id = ? ;
        `;

        if (typeof password === 'undefined') {
            sql = `
              UPDATE
                \`user\`
              SET username     = ?,
                  firstname    = ?,
                  lastname     = ?,
                  email        = ?,
                  mobile_number = ?,
                  \`password\` = \`password\`,
                  updated_by = ?
              WHERE id = ?;
            `;
        }

        try {
            let query_var = [
                username,
                firstname,
                lastname,
                email,
                mobileNumber,
                password,
                updatedBy,
                userId,
            ];

            if (typeof password === 'undefined') {
                query_var = [
                    username,
                    firstname,
                    lastname,
                    email,
                    mobileNumber,
                    updatedBy,
                    userId,
                ];
            }

            const query = await db.query(sql, query_var);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function approveUser(userId, updatedBy) {

        let sql = `
            UPDATE 
              \`user\` 
            SET
              is_active = 1,
              updated_by = ?,
              last_updated     = NOW()
            WHERE id = ? ;
        `;


        try {

            const query = await db.query(sql, [
                updatedBy,
                userId,
            ]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function updateUserSelf(firstname, lastname, userId, password) {

        let sql = `
            UPDATE 
              \`user\` 
            SET
              firstname = ?,
              lastname = ?,
              password = ?,
              last_updated     = NOW(),
              updated_by = ?
            WHERE id = ? ;
        `;

        if (typeof password === 'undefined') {
            sql = `
              UPDATE
                \`user\`
              SET firstname    = ?,
                  lastname     = ?,
                  
                  \`password\` = \`password\`,
                  last_updated     = NOW(),
                  updated_by = ?
              WHERE id = ?;
            `;
        }

        try {
            let query_var = [
                firstname,
                lastname,
                password,
                userId,
                userId,
            ];

            if (typeof password === 'undefined') {
                query_var = [
                    firstname,
                    lastname,
                    userId,
                    userId,
                ];
            }

            const query = await db.query(sql, query_var);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    function getUserAccessRules(userType, userToEditUserType, userManagementCompanyId, userToEditManagementCompanyId) {

        if (userToEditUserType === 'Super Administrator') {
            return {
                status: false,
                msg: "You cannot edit Super Administrator Accounts."
            };
        }

        if (userType === 'Super Administrator') {
            // if (userToEditUserType !== 'Account Holder') {
            //
            //     return {
            //         status: false,
            //         msg: "Super Administrators can only edit Account Holders."
            //     };
            // }

            // Bypass managing company checks if you are a super admin.
            if (userToEditUserType === 'Account Holder') {

                return {
                    status: true,
                    msg: "All permission checks pass."
                };
            }
        }

        if (userType === 'Account Holder') {
            // Only allowed to update account holders.
            if (!(userToEditUserType === 'Account Holder' || userToEditUserType === 'Administrator' || userToEditUserType === 'Reviewer')) {

                return {
                    status: false,
                    msg: "Account Holders can only edit other Administrator and Account Holders."
                };
            }
        }

        if (userType === 'Administrator') {

            const inUserType = ['Manager', 'Administrator', 'Compliance Certifier', 'Reviewer'].indexOf(userToEditUserType) !== -1;

            if (inUserType === false) {
                return {
                    status: false,
                    msg: "Administrators can only edit other Administrator."
                };
            }
        }

        if (userManagementCompanyId !== userToEditManagementCompanyId) {
            return {
                status: false,
                msg: "You cannot edit a user belonging to a different managing company."
            };
        }

        return {
            status: true,
            msg: "All permission checks pass."
        };
    }

    async function getUserByEmail(email) {
        const sql = `
            SELECT user_type.name AS user_type FROM \`user\` 
            INNER JOIN user_type 
              ON 1 = 1
              AND user.user_type_id = user_type.id
            WHERE 1 = 1
              AND email = ?;
        `;

        try {
            const query = await db.query(sql, [email]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getUserActivityCategoryByName(name) {
        const sql = `
            SELECT * FROM user_activity_category a 
            WHERE 1 = 1
              AND a.name = ?
        `;

        try {
            const query = await db.query(sql, [name]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getUserActivityEntityByName(name) {
        const sql = `
            SELECT * FROM user_activity_entity a 
            WHERE 1 = 1
              AND a.name = ?
        `;

        try {
            const query = await db.query(sql, [name]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function addUserActivity(userId, userActivityEntityId, userActivityCategoryId) {
        const sql = `
              INSERT INTO user_activity (
                user_id,
                user_activity_entity_id,
                user_activity_category_id
              ) 
              VALUES
                (
                  ?,
                  ?,
                  ?
                ) ;
        `;

        try {
            db.queryTransaction();
            const query = await db.query(sql, [
                userId,
                userActivityEntityId,
                userActivityCategoryId,
            ]);

            // console.log(query);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getUserActivityInSameManagementCompany(managementCompanyId) {
        const sql = `
          SELECT a.id,
                 e.name                                           AS user_type,
                 CONCAT(d.lastname, ', ', d.firstname)            AS \`user\`,
                 b.name                                           AS category,
                 c.name                                           AS entity,
                 DATE_FORMAT(a.date_entered, '%Y-%m-%d %h:%i %p') AS timestamp
          FROM user_activity a
                 INNER JOIN user_activity_category b
                            ON 1 = 1
                              AND a.user_activity_category_id = b.id
                 INNER JOIN user_activity_entity c
                            ON 1 = 1
                              AND a.user_activity_entity_id = c.id
                 INNER JOIN \`user\` d
                            ON 1 = 1
                              AND a.user_id = d.id
                 INNER JOIN \`user_type\` e
                            ON 1 = 1
                              AND d.user_type_id = e.id
          WHERE 1 = 1
            AND d.management_company_id = ?
          ORDER BY a.date_entered DESC
          LIMIT 500
        `;

        try {
            const query = await db.query(sql, [managementCompanyId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    function addManagementCompanyAndAccountHolder(firstname, lastname, email, managementCompany) {

        const connection = db.getMySQL_connection();
        const promisedQuery = db.getPromisifiedQuery(connection);

        return new Promise((resolve, reject) => {
            connection.beginTransaction(async () => {
                try {
                    // Insert name and get ID.
                    const newManagementCompanyId = (await promisedQuery(`
                        INSERT INTO management_company (\`name\`)
                        VALUES (?) 
                    `, [managementCompany])).insertId;

                    const password = passwordGenerator.generate({length: 10, numbers: false});

                    // Insert newly generated management ID to user.
                    const newUser = await promisedQuery(`
                        INSERT INTO \`user\` (firstname, lastname, email, username, management_company_id, \`password\`, user_type_id, is_active)
                        VALUES (
                            ?, 
                            ?, 
                            ?, 
                            ?, 
                            ?,
                            ?,
                            (SELECT id FROM user_type WHERE \`name\` = "Account Holder"),
                            2
                        ) 
                    `, [
                        firstname,
                        lastname,
                        email,
                        email,
                        newManagementCompanyId,
                        password,
                    ], 1);

                    connection.commit();

                    resolve({
                        password: password,
                        user_id: newUser.insertId
                    })
                } catch (err) {
                    console.log(err);
                    console.log('Roll-backed WITH error');
                    connection.rollback();
                    reject(err);
                }
            });
        });
    }

    async function checkUserCreatedEntries(userId) {
        // Check if this user has ties to any active "Location" or "Company"
        // Prevent them from being deleted if so.
        let sql = `
            SELECT 
              a.\`name\`,
              'location' AS entity_type
            FROM
              location a 
            WHERE 1 = 1 
              AND a.\`created_by\` = ?
              AND a.\`is_active\` = 1
              
            UNION ALL 
            
            SELECT 
              a.\`name\`,
              'company' AS entity_type
            FROM
              company a 
            WHERE 1 = 1 
              AND a.\`created_by\` = ?
              AND a.\`is_active\` = 1
              
            UNION ALL 
            
            SELECT 
              b.\`name\`,
              'company' AS entity_type
            FROM
              compliance a 
              INNER JOIN compliance_measure b
                ON 1 = 1
                  AND a.compliance_measure_id = b.id
            WHERE 1 = 1 
              AND a.\`created_by\` = ?
              AND a.\`is_active\` = 1
        `;

        try {
            return await db.query(sql, [userId, userId, userId], 1);
        } catch (err) {
            return err;
        }
    }

    async function getUserViaUserAndPass(username, password) {
        let sql = `
            SELECT 
                * 
            FROM \`user\` a
            WHERE 1 = 1 
                AND a.username = ?
                AND a.password = ?
        `;

        const result = await db.query(sql, [username, password]);

    }

    return {

        getUserViaUserAndPass: getUserViaUserAndPass,
        checkUserCreatedEntries: checkUserCreatedEntries,
        addManagementCompanyAndAccountHolder: addManagementCompanyAndAccountHolder,

        /**
         * Views
         */

        getManagementCompanies: getManagementCompanies,
        getAccountTypes: getAccountTypes,
        getUserDetails: getUserDetails,
        getUser:getUser,
        getUserTypeById: getUserTypeById,

        /**
         * Standard API methods.
         */
        getUserActivityInSameManagementCompany: getUserActivityInSameManagementCompany,
        getUserActivityCategoryByName: getUserActivityCategoryByName,
        getUserActivityEntityByName: getUserActivityEntityByName,
        getUserById: getUserById,
        getUserByEmail: getUserByEmail,
        getUserCreatorByUserId: getUserCreatorByUserId,
        getAddUserRules: getAddUserRules,
        getVoidUserRules: getVoidUserRules,
        getApproveUserRules: getApproveUserRules,
        validateUserType: validateUserType,

        // CRUD.
        addUserActivity: addUserActivity,
        addUser: addUser,
        voidUser: voidUser,
        updateUser: updateUser,
        approveUser: approveUser,
        updateUserSelf: updateUserSelf,

        // Utils or Logic
        getUserAccessRules: getUserAccessRules,
    }

})();

module.exports = Service;