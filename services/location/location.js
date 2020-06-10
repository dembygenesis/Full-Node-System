var express = require('express'),
    _ = require('lodash'),
    db = require('../database/database'),
    transaction = require('../database/transaction'),
    Utils = require('../../services/utils');

const Service = (function () {

    async function getLocationByLocationAndUserId(locationId, userId) {

        // Location -> join company -> join assigned companies
        const sql = `
          SELECT *
          FROM location a
                 INNER JOIN
               WHERE 1 = 1 AND user_id = ? AND id = ? AND payment_status != 'Suspended'
        `;

        try {
            const query = await db.query(sql, [userId, locationId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function updateLocationById(
        locationId,
        name,
        streetName,
        streetNumber,
        suburb,
        postalCode,
        companyId,
        userId,
        locationTypeId,
        state,
    ) {

        const sql = `
          UPDATE
            location
          SET location_type_id  = ?,
              \`name\`          = ?,
              \`street_name\`   = ?,
              \`street_number\` = ?,
              suburb            = ?,
              postal_code       = ?,
              company_id        = ?,
              updated_by        = ?,
              state             = ?,
              last_updated      = NOW()
          WHERE id = ?;
              
        `;

        try {
            const query = await db.query(sql, [
                locationTypeId,
                name,
                streetName,
                streetNumber,
                suburb,
                postalCode,
                companyId,
                userId,
                state,
                locationId,
            ]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function addLocation(
        name,
        streetName,
        streetNumber,
        suburb,
        postalCode,
        companyId,
        userId,
        locationTypeId,
        state
    ) {

        const sql = `
          INSERT INTO location (location_type_id,
                                \`name\`,
                                street_name,
                                street_number,
                                suburb,
                                postal_code,
                                company_id,
                                created_by,
                                state)
          VALUES (?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?,
                  ?);
        `;

        try {
            const query = await db.query(sql, [
                locationTypeId,
                name,
                streetName,
                streetNumber,
                suburb,
                postalCode,
                companyId,
                userId,
                state,
            ]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function assignLocationToManager(userIds, userId, locationId) {

        try {
            let sqlValues = '';

            userIds = userIds.split(',');

            for (let i in userIds) {
                const userId = userIds[i];

                sqlValues = sqlValues + `(${userId}, ${userId}, ${locationId}),`;
            }

            sqlValues = sqlValues.slice(0, -1);

            let sql = `
              INSERT INTO manager_assigned_location (
                 user_id,
                 user_id_assignee,
                 location_id
               ) 
               VALUES ${sqlValues}
            `;

            const result = await db.query(sql, [userId]);

            return result;

        } catch (errors) {
            return errors;
        }
    }

    async function removeLocationFromManager(userIds, userId, locationId) {

        try {
            let sqlValues = '';

            userIds = userIds.split(',');

            for (let i in userIds) {
                const userId = userIds[i];

                sqlValues = sqlValues + `(user_id_assignee = ${userId} AND location_id = ${locationId}) OR`;
            }

            sqlValues = sqlValues.slice(0, -3);

            /*let sql = `
              DELETE FROM manager_assigned_location
              WHERE ${sqlValues}
            `;*/

            let sql = `
              UPDATE manager_assigned_location
                SET is_active = 0,
                    updated_by = ?,
                    last_updated = NOW()
              WHERE ${sqlValues}
            `;

            const result = await db.query(sql, [userId]);

            return result;
        } catch (errors) {
            return errors;
        }
    }

    async function deleteLocationById(id, userId) {

        const sql = `
          UPDATE location
          SET is_active    = 0,
              last_updated = NOW(),
              updated_by   = ?
          WHERE id = ?
        `;

        try {
            const query = await db.query(sql, [userId, id]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function voidLocationById(id, userId) {

        const sql = `
          UPDATE location
          SET is_active    = 0,
              updated_by   = ?,
              last_updated = NOW()
          WHERE id = ?
        `;

        try {
            const query = await db.query(sql, [id, userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getLocationsByUserId(userId) {

        const sql = `
          SELECT a.id,
                 a.name,
                 a.street_name,
                 a.street_number,
                 b.name AS location_type,
                 c.name AS company,
                 suburb,
                 a.postal_code,
                 state
          FROM location a
                 INNER JOIN location_type b
                            ON 1 = 1
                              AND a.location_type_id = b.id
                 INNER JOIN company c
                            ON 1 = 1
                              AND a.company_id = c.id
          WHERE user_id = ?
          AND a.payment_status != 'Suspended'

        `;

        try {
            const query = await db.query(sql, [userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getLocationsByManagementId(managementCompanyId, userId, userType) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT a.id,
                     a.name,
                     a.street_name,
                     a.street_number,
                     z.name AS location_type,
                     b.name AS company,
                     suburb,
                     a.postal_code,
                     state
              FROM location a
                     INNER JOIN location_type z
                                ON 1 = 1
                                  AND a.location_type_id = z.id
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN \`user\` c
                                ON 1 = 1
                                  AND b.\`created_by\` = c.\`id\`
                     INNER JOIN account_holder_assigned_company d
                                ON 1 = 1
                                  AND b.id = d.company_id
              WHERE 1 = 1
                AND c.\`management_company_id\` = ?
                AND d.\`user_id_assignee\` = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND a.payment_status != 'Suspended'
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT a.id,
                     a.name,
                     a.street_name,
                     a.street_number,
                     z.name AS location_type,
                     b.name AS company,
                     suburb,
                     a.postal_code,
                     state
              FROM location a
                     INNER JOIN location_type z
                                ON 1 = 1
                                  AND a.location_type_id = z.id
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN \`user\` c
                                ON 1 = 1
                                  AND b.\`created_by\` = c.\`id\`
                     INNER JOIN reviewer_assigned_company d
                                ON 1 = 1
                                  AND b.id = d.company_id
              WHERE 1 = 1
                AND c.\`management_company_id\` = ?
                AND d.\`user_id_assignee\` = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND a.payment_status != 'Suspended'
            `;
        }

        const Transaction = new db.Transaction;

        // Add history.
        Transaction.addTransaction({
            stmt: `
                INSERT INTO user_activity (
                    user_id,
                    user_activity_entity_id,
                    user_activity_category_id
                  )
                  VALUES
                  (
                    ${userId},
                    (SELECT \`id\` FROM user_activity_entity WHERE \`name\` = 'Location'),
                    (SELECT \`id\` FROM user_activity_category WHERE \`name\` = 'Viewed')
                  ) ;
            `,
            args: [],
        });

        // Select data.
        Transaction.addTransaction({
            stmt: sql,
            args: [managementCompanyId, userId,]
        });

        try {
            const query = await Transaction.executeTransaction();

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getLocationsPaymentStatusByManagementId(managementCompanyId, userId, userType) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT a.id,
                     a.name,
                     a.street_name,
                     a.street_number,
                     z.name AS location_type,
                     b.name AS company,
                     suburb,
                     a.postal_code,
                     state,
                     a.invoice_due_date, 
                     a.payment_status, 
                    DATE_ADD(a.invoice_due_date, INTERVAL 2 WEEK) as suspension_date
              FROM location a
                     INNER JOIN location_type z
                                ON 1 = 1
                                  AND a.location_type_id = z.id
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN \`user\` c
                                ON 1 = 1
                                  AND b.\`created_by\` = c.\`id\`
                     INNER JOIN account_holder_assigned_company d
                                ON 1 = 1
                                  AND b.id = d.company_id
              WHERE 1 = 1
                AND c.\`management_company_id\` = ?
                AND d.\`user_id_assignee\` = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT a.id,
                     a.name,
                     a.street_name,
                     a.street_number,
                     z.name AS location_type,
                     b.name AS company,
                     suburb,
                     a.postal_code,
                     state,
                     a.invoice_due_date, 
                     a.payment_status, 
                    DATE_ADD(a.invoice_due_date, INTERVAL 2 WEEK) as suspension_date
              FROM location a
                     INNER JOIN location_type z
                                ON 1 = 1
                                  AND a.location_type_id = z.id
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN \`user\` c
                                ON 1 = 1
                                  AND b.\`created_by\` = c.\`id\`
                     INNER JOIN reviewer_assigned_company d
                                ON 1 = 1
                                  AND b.id = d.company_id
              WHERE 1 = 1
                AND c.\`management_company_id\` = ?
                AND d.\`user_id_assignee\` = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
            `;
        }

        const Transaction = new db.Transaction;

        // Add history.
        Transaction.addTransaction({
            stmt: `
                INSERT INTO user_activity (
                    user_id,
                    user_activity_entity_id,
                    user_activity_category_id
                  )
                  VALUES
                  (
                    ${userId},
                    (SELECT \`id\` FROM user_activity_entity WHERE \`name\` = 'Location'),
                    (SELECT \`id\` FROM user_activity_category WHERE \`name\` = 'Viewed')
                  ) ;
            `,
            args: [],
        });

        // Select data.
        Transaction.addTransaction({
            stmt: sql,
            args: [managementCompanyId, userId,]
        });

        try {
            const query = await Transaction.executeTransaction();

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getLocationsByUserIdAndCompanyId(managementCompanyId, companyId, userType, userId) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT a.id,
                     a.name,
                     a.street_name,
                     a.street_number,
                     z.name AS location_type,
                     b.name AS company,
                     suburb,
                     a.postal_code,
                     state
              FROM location a
                     INNER JOIN location_type z
                                ON 1 = 1
                                  AND a.location_type_id = z.id
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN \`user\` c
                                ON 1 = 1
                                  AND b.\`created_by\` = c.\`id\`
                     INNER JOIN account_holder_assigned_company d
                                ON 1 = 1
                                  AND b.id = d.company_id
              WHERE 1 = 1
                AND c.\`management_company_id\` = ?
                AND b.id = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND a.payment_status != 'Suspended'
              GROUP BY a.id
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT a.id,
                     a.name,
                     a.street_name,
                     a.street_number,
                     z.name AS location_type,
                     b.name AS company,
                     suburb,
                     a.postal_code,
                     state
              FROM location a
                     INNER JOIN location_type z
                                ON 1 = 1
                                  AND a.location_type_id = z.id
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN \`user\` c
                                ON 1 = 1
                                  AND b.\`created_by\` = c.\`id\`
                     INNER JOIN reviewer_assigned_company d
                                ON 1 = 1
                                  AND b.id = d.company_id
              WHERE 1 = 1
                AND c.\`management_company_id\` = ?
                AND b.id = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND a.payment_status != 'Suspended'
              GROUP BY a.id
            `;
        }

        const Transaction = new db.Transaction;

        Transaction.addTransaction({
            stmt: `
                INSERT INTO user_activity (
                    user_id,
                    user_activity_entity_id,
                    user_activity_category_id
                  )
                  VALUES
                  (
                    ${userId},
                    (SELECT \`id\` FROM user_activity_entity WHERE \`name\` = 'Location'),
                    (SELECT \`id\` FROM user_activity_category WHERE \`name\` = 'Viewed')
                  ) ;
            `,
            args: [],
        });

        Transaction.addTransaction({
            stmt: sql,
            args: [managementCompanyId, companyId]
        });

        try {
            return await Transaction.executeTransaction();
        } catch (errors) {
            return errors;
        }
    }

    async function getLocationCompaniesByUserId(userId, userType) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT b.id,
                     b.name
              FROM account_holder_assigned_company a
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.company_id = b.id
                                  AND b.is_active = 1
              WHERE 1 = 1
                AND a.user_id_assignee = ?
                AND a.is_active = 1
              GROUP BY b.id
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT b.id,
                     b.name
              FROM reviewer_assigned_company a
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.company_id = b.id
                                  AND b.is_active = 1
              WHERE 1 = 1
                AND a.user_id_assignee = ?
                AND a.is_active = 1
              GROUP BY b.id
            `;
        }

        try {
            const query = await db.query(sql, [userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getLocationTypes() {

        // Maybe change this query to get all the companies that were assigned to you.
        const sql = `
          SELECT *
          FROM location_type
          ORDER BY \`name\` ASC
        `;

        try {
            const query = await db.query(sql);

            return query;
        } catch (errors) {
            return errors;
        }
    }


    async function getLocationAccessThroughCompaniesAssigned(locationId, userId, userType, managementCompanyId) {

        let sql = '';

        if (userType === 'Manager') {
            sql = `
              SELECT a.*
              FROM location a
                     INNER JOIN manager_assigned_location b
                                ON 1 = 1
                                  AND a.id = b.location_id
                                  AND b.user_id_assignee = ?
                     INNER JOIN \`user\` c
                                ON 1 = 1
                                  AND a.created_by = c.id
                                  AND c.management_company_id = ?
              WHERE 1 = 1
                AND a.id = ?
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND a.payment_status != 'Suspended'
              GROUP BY a.id
            `;
        }

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT a.*
              FROM location a
                     INNER JOIN account_holder_assigned_company b
                                ON 1 = 1
                                  AND a.company_id = b.company_id
                                  AND b.user_id_assignee = ?
                     INNER JOIN \`user\` c
                                ON 1 = 1
                                  AND a.created_by = c.id
                                  AND c.management_company_id = ?
              WHERE 1 = 1
                AND a.id = ?
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND a.payment_status != 'Suspended'
              GROUP BY a.id
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT a.*
              FROM location a
                     INNER JOIN reviewer_assigned_company b
                                ON 1 = 1
                                  AND a.company_id = b.company_id
                                  AND b.user_id_assignee = ?
                     INNER JOIN \`user\` c
                                ON 1 = 1
                                  AND a.created_by = c.id
                                  AND c.management_company_id = ?
              WHERE 1 = 1
                AND a.id = ?
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND a.payment_status != 'Suspended'
              GROUP BY a.id
            `;
        }

        if (userType === 'Compliance Certifier') {
            sql = `
              SELECT d.*
              FROM compliance_contributor_assigned_measures a
                     INNER JOIN compliance b
                                ON 1 = 1
                                  AND a.compliance_id = b.id
                                  AND a.user_id = ?
                     INNER JOIN \`space\` c
                                ON 1 = 1
                                  AND b.space_id = c.id
                     INNER JOIN location d
                                ON 1 = 1
                                  AND c.location_id = d.id
                     INNER JOIN \`user\` e
                                ON 1 = 1
                                  AND d.created_by = e.id
              WHERE 1 = 1
                AND d.id = ?
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND d.payment_status != 'Suspended'
              GROUP BY d.id
            `;
        }

        try {
            let params = [userId, managementCompanyId, locationId];

            // Compliance Certifiers are "Management Company" agnostic.
            if (userType === 'Compliance Certifier') {
                params = [userId, locationId];
            }

            const query = await db.query(sql, params);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getStates() {
        const sql = `
          SELECT a.*
          FROM austrailia_states a
        `;

        try {
            const query = await db.query(sql);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getState(state) {
        const sql = `
          SELECT a.*
          FROM austrailia_states a
          WHERE 1 = 1
            AND state = ?
        `;

        try {
            const query = await db.query(sql, [state]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getPostCodesByState(state) {
        const sql = `
          SELECT a.postcode
          FROM austrailia_postcodes a
          WHERE 1 = 1
            AND state = ?
          ORDER BY a.postcode ASC
        `;

        try {
            const query = await db.query(sql, [state]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getPostCodeByState(postalCode, state) {
        const sql = `
          SELECT a.postcode
          FROM austrailia_postcodes a
          WHERE 1 = 1
            AND postcode = ?
            AND state = ?
        `;

        try {
            const query = await db.query(sql, [postalCode, state]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function userHasCompanies(userId, userType) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT COUNT(*) AS company_count
              FROM account_holder_assigned_company c
              WHERE 1 = 1
                AND c.user_id_assignee = ?
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT COUNT(*) AS company_count
              FROM reviewer_assigned_company c
              WHERE 1 = 1
                AND c.user_id_assignee = ?
            `;
        }

        try {
            const query = await db.query(sql, [userId]);

            const companyCount = parseFloat(query[0]['company_count']);

            return companyCount !== 0;
        } catch (errors) {
            return errors;
        }
    }

    async function userHasCompaniesWithLocations(userId, userType) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT COUNT(*) AS location_count
              FROM account_holder_assigned_company c
                     INNER JOIN company co
                                ON 1 = 1
                                  AND c.company_id = co.id
              WHERE 1 = 1
                AND c.user_id_assignee = ?
                AND c.is_active = 1
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT COUNT(*) AS location_count
              FROM reviewer_assigned_company c
                     INNER JOIN company co
                                ON 1 = 1
                                  AND c.company_id = co.id
              WHERE 1 = 1
                AND c.user_id_assignee = ?
                AND c.is_active = 1
            `;
        }

        try {
            const query = await db.query(sql, [userId], 1);

            const locationCount = parseFloat(query[0]['location_count']);

            return locationCount !== 0;
        } catch (errors) {
            return errors;
        }
    }

    async function getAssignableManagersByManagementId(managementCompanyId, locationId) {

        const sql = `
          SELECT a.\`id\`                                                 AS user_id,
                 b.\`name\`                                               AS user_type,
                 CONCAT(a.\`lastname\`, ', ', a.\`firstname\`)            AS \`name\`,
                 c.id                                                     AS assigned_id,
                 IF(c.user_id_assignee IS NULL, 'Unassigned', 'Assigned') AS \`type\`
          FROM \`user\` a
                 INNER JOIN user_type b
                            ON 1 = 1
                              AND a.\`user_type_id\` = b.\`id\`
                 LEFT JOIN \`manager_assigned_location\` c
                           ON 1 = 1
                             AND c.\`user_id\` = a.\`id\`
                             AND c.\`location_id\` = ?
                             AND c.\`is_active\` = 1
          WHERE 1 = 1
            AND a.\`user_type_id\` = b.\`id\`
            AND b.\`name\` IN ('Manager', 'Reviewer')
            AND a.\`management_company_id\` = ?
            AND a.is_active = 1
        `;

        try {
            const query = await db.query(sql, [
                locationId,
                managementCompanyId,
            ]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function isValidStates(selectedStates) {
        selectedStates = _.uniq(selectedStates);

        const selectStatesLength = selectedStates.length;

        selectedStates = selectedStates.map(selectedState => `'${selectedState}'`).join(',');

        const sql = `
            SELECT 
                   COUNT(*) AS state_count 
            FROM austrailia_states 
            WHERE state IN (${selectedStates})
        `;

        try {
            const query = await db.query(sql);

            return selectStatesLength === parseFloat(query[0]['state_count']);
        } catch (errors) {
            console.log(errors);
        }
    }

    async function assignedManagerCompanyHasNoCurrentActive(userIds, locationId) {

        try {
            let sqlValues = '';

            userIds = userIds.split(',');

            for (let i in userIds) {
                const userId = userIds[i];

                sqlValues = sqlValues + `(user_id_assignee = ${userId} AND location_id = ${locationId} AND is_active = 1) OR`;
            }

            sqlValues = sqlValues.slice(0, -2);

            let sql = `
              SELECT 
                     COUNT(*) AS assigned_company_count 
              FROM manager_assigned_location
               WHERE ${sqlValues}
            `;

            const count = parseFloat((await db.query(sql))[0]['assigned_company_count']);

            return count === 0;
        } catch (errors) {
            return errors;
        }
    }

    async function getDependencies(locationId) {

        const sql = `
            SELECT 
                space.name
            FROM location 
              
            INNER JOIN \`space\`
                ON 1 = 1 
                  AND location.id = space.location_id
                  AND space.is_active = 1

            WHERE 1 = 1 
              AND location.payment_status != 'Suspended'
              AND location.id = ?
        `;

        try {
            const query = await db.query(sql, [locationId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    return {
        getDependencies: getDependencies,
        assignedManagerCompanyHasNoCurrentActive: assignedManagerCompanyHasNoCurrentActive,
        isValidStates: isValidStates,
        getState: getState,
        getAssignableManagersByManagementId: getAssignableManagersByManagementId,
        userHasCompanies: userHasCompanies,
        userHasCompaniesWithLocations: userHasCompaniesWithLocations,
        getPostCodeByState: getPostCodeByState,
        getPostCodesByState: getPostCodesByState,
        getStates: getStates,
        getLocationTypes: getLocationTypes,
        deleteLocationById: deleteLocationById,
        voidLocationById: voidLocationById,
        getLocationByLocationAndUserId: getLocationByLocationAndUserId,
        getLocationAccessThroughCompaniesAssigned: getLocationAccessThroughCompaniesAssigned,
        updateLocationById: updateLocationById,
        addLocation: addLocation,
        assignLocationToManager: assignLocationToManager,
        removeLocationFromManager: removeLocationFromManager,
        getLocationsByUserId: getLocationsByUserId,
        getLocationsByManagementId: getLocationsByManagementId,
        getLocationsPaymentStatusByManagementId: getLocationsPaymentStatusByManagementId,
        getLocationsByUserIdAndCompanyId: getLocationsByUserIdAndCompanyId,
        getLocationCompaniesByUserId: getLocationCompaniesByUserId,
    }

})();

module.exports = Service;