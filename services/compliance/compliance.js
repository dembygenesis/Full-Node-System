var express = require('express'),
    _ = require('lodash'),
    db = require('../database/database'),
    transaction = require('../database/transaction'),
    Utils = require('../../services/utils');

const Service = (function () {

    async function addCompliance(complianceMeasureIds,
                                 spaceId,
                                 userId,) {
        try {

            let insertParameters = complianceMeasureIds.split(',').reduce((accumulator, complianceMeasureId) => (
                accumulator += `(
                    ${complianceMeasureId}, 
                    NOW(), 
                    ${userId}, 
                    ${spaceId}, 
                    (SELECT 
                      CASE
                        WHEN (b.name = 'month') 
                        THEN DATE_ADD(
                          NOW(),
                          INTERVAL a.frequency_unit MONTH
                        ) 
                        WHEN (b.name = 'year') 
                        THEN DATE_ADD(
                          NOW(),
                          INTERVAL a.frequency_unit YEAR
                        ) 
                      END AS due_date 
                    FROM
                      \`compliance_measure\` a 
                      INNER JOIN compliance_measure_frequency_category b 
                        ON 1 = 1 
                        AND a.\`frequency_type\` = b.\`id\` 
                    WHERE a.id = ${complianceMeasureId})
                ),`
            ), '');

            insertParameters = insertParameters.substring(0, insertParameters.length - 1);

            const sql = `
              INSERT INTO compliance (compliance_measure_id, created_date, created_by, space_id, due_for_checking)
              VALUES ${insertParameters}
            `;

            const query = await db.query(sql);

            return query;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async function deleteCompliance(complianceId,
                                    userId,) {
        try {
            const sql = `
              UPDATE compliance
                SET is_active = 0,
                    last_updated = NOW(),
                    updated_by = ?
              WHERE id IN ( ? )
            `;

            const query = await db.query(sql, [
                userId,
                complianceId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function updateCompliance(complianceId, complianceMeasureId, spaceId) {
        try {
            const sql = `
              UPDATE
                compliance
              SET compliance_measure_id = ?,
                  space_id              = ?
              WHERE id = ?;
            `;

            const query = await db.query(sql, [
                complianceMeasureId,
                spaceId,
                complianceId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getComplianceAccessPrivilege(complianceId, userId, userType) {
        try {

            let sql = '';

            if (userType === 'Manager') {
                sql = `
                  SELECT COUNT(*) AS compliance_access
                  FROM compliance a
                         INNER JOIN space b
                                    ON 1 = 1
                                      AND a.space_id = b.id
                         INNER JOIN manager_assigned_location c
                                    ON 1 = 1
                                      AND b.location_id = c.location_id          
                  WHERE 1 = 1
                    AND c.user_id_assignee = ?
                    AND a.id IN ( ? )
                    
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                `;
            }

            if (userType === 'Administrator' || userType === 'Account Holder' ) {
                sql = `
                  SELECT COUNT(*) AS compliance_access
                  FROM compliance a
                         INNER JOIN space b
                                    ON 1 = 1
                                      AND a.space_id = b.id
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND b.location_id = c.id
                         INNER JOIN account_holder_assigned_company d
                                    ON 1 = 1
                                      AND c.company_id = d.company_id
                                      AND d.user_id_assignee = ?
                  WHERE 1 = 1
                    AND a.id IN ( ? )

                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'

                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT COUNT(*) AS compliance_access
                  FROM compliance a
                         INNER JOIN space b
                                    ON 1 = 1
                                      AND a.space_id = b.id
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND b.location_id = c.id
                         INNER JOIN reviewer_assigned_company d
                                    ON 1 = 1
                                      AND c.company_id = d.company_id
                                      AND d.user_id_assignee = ?
                  WHERE 1 = 1
                    AND a.id IN ( ? )

                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                `;
            }

            if (userType === 'Compliance Certifier') {
                sql = `
                  SELECT COUNT(b.id) AS compliance_access
                  FROM compliance_contributor_assigned_measures a
                         INNER JOIN compliance b
                                    ON 1 = 1
                                      AND a.compliance_id = b.id
                  WHERE 1 = 1
                    AND a.user_id = ?
                    AND b.id IN ( ? )

                    AND a.is_active = 1
                    AND b.is_active = 1
                `;
            }

            const query = await db.query(sql, [
                userId,
                complianceId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getCompliances(userId) {
        try {
            const sql = `
              SELECT a.id,
                     d.name     AS company,
                     c.\`name\` AS location,
                     b.\`name\` AS \`space\`,
                     f.\`name\` AS category,
                     e.\`name\` AS measure
              FROM compliance a
                     INNER JOIN \`space\` b
                                ON 1 = 1
                                  AND a.space_id = b.id
                     INNER JOIN location c
                                ON 1 = 1
                                  AND b.location_id = c.id
                     INNER JOIN company d
                                ON 1 = 1
                                  AND c.company_id = d.id
                     INNER JOIN compliance_measure e
                                ON 1 = 1
                                  AND a.\`compliance_measure_id\` = e.\`id\`
                     INNER JOIN compliance_category f
                                ON 1 = 1
                                  AND e.\`compliance_category_id\` = f.\`id\`
                     INNER JOIN \`account_holder_assigned_company\` g
                                ON 1 = 1
                                  AND g.\`company_id\` = c.\`company_id\`
                                  AND g.\`user_id_assignee\` = ?
              WHERE 1 = 1
              AND c.payment_status != 'Suspended'
            `;

            const query = await db.query(sql, [
                userId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getComplianceById(complianceId) {
        try {
            const sql = `
              SELECT a.*,
                     c.id AS compliance_category_id
              FROM compliance a
                     INNER JOIN compliance_measure b
                                ON 1 = 1
                                  AND a.compliance_measure_id = b.id
                     INNER JOIN compliance_category c
                                ON 1 = 1
                                  AND b.compliance_category_id = c.id
              WHERE a.id = ?
            `;

            const query = await db.query(sql, [
                complianceId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getComplianceFilters(userId) {
        try {
            const sql = `
              SELECT c.\`id\`   AS company_id,
                     c.\`name\` AS company_name,
                     b.\`id\`   AS location_id,
                     b.\`name\` AS location_name,
                     a.\`id\`   AS space_id,
                     a.\`name\` AS space_name
              FROM \`space\` a
                     INNER JOIN location b
                                ON 1 = 1
                                  AND a.\`location_id\` = b.\`id\`
                     INNER JOIN company c
                                ON 1 = 1
                                  AND b.\`company_id\` = c.\`id\`
                     INNER JOIN \`account_holder_assigned_company\` d
                                ON 1 = 1
                                  AND b.\`company_id\` = d.\`company_id\`
              WHERE 1 = 1
                AND d.\`user_id_assignee\` = ?
                AND b.payment_status != 'Suspended'
            `;

            const query = await db.query(sql, [
                userId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getComplianceCategories(userId) {
        try {
            const sql = `
              SELECT *
              FROM compliance_category
            `;

            const query = await db.query(sql, [
                userId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getComplianceMeasures(userId) {
        try {
            const sql = `
              SELECT *
              FROM compliance_measure
            `;

            const query = await db.query(sql, [
                userId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getComplianceCategoriesAndMeasures() {
        try {
            const sql = `
              SELECT a.\`id\`   AS compliance_measure_id,
                     a.\`name\` AS compliance_measure_name,
                     b.\`id\`   AS compliance_category_id,
                     b.\`name\` AS compliance_category_name
              FROM compliance_measure a
                     INNER JOIN compliance_category b
                                ON 1 = 1
                                  AND a.\`compliance_category_id\` = b.\`id\`
              GROUP BY a.\`id\`
            `;

            const query = await db.query(sql);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getSpacesCount(userId, userType) {

        try {
            let sql = '';

            if (userType === 'Administrator' || userType === 'Account Holder' ) {
                sql = `
                  SELECT COUNT(a.\`id\`) AS space_count
                  FROM \`space\` a
                         INNER JOIN location b
                                    ON 1 = 1
                                      AND a.\`location_id\` = b.\`id\`
                         INNER JOIN account_holder_assigned_company c
                                    ON 1 = 1
                                      AND c.\`company_id\` = b.\`company_id\`
                                      AND c.\`user_id_assignee\` = ?
                  WHERE 1 = 1
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND b.payment_status != 'Suspended'
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT COUNT(a.\`id\`) AS space_count
                  FROM \`space\` a
                         INNER JOIN location b
                                    ON 1 = 1
                                      AND a.\`location_id\` = b.\`id\`
                         INNER JOIN reviewer_assigned_company c
                                    ON 1 = 1
                                      AND c.\`company_id\` = b.\`company_id\`
                                      AND c.\`user_id_assignee\` = ?
                  WHERE 1 = 1
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND b.payment_status != 'Suspended'
                `;
            }

            if (userType === 'Manager') {
                sql = `
                  SELECT COUNT(a.\`id\`) AS space_count
                  FROM \`space\` a
                         INNER JOIN location b
                                    ON 1 = 1
                                      AND a.\`location_id\` = b.\`id\`
                         INNER JOIN manager_assigned_location c
                                    ON 1 = 1
                                      AND c.\`location_id\` = b.\`id\`
                                      AND c.\`user_id_assignee\` = ?
                  WHERE 1 = 1
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND b.payment_status != 'Suspended'
                `;
            }

            const query = await db.query(sql, [userId]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function checkValidComplianceMeasureIds(complianceMeasureIds, userId) {

        try {
            const sql = `
                SELECT COUNT(*) AS compliance_measure_count 
                FROM compliance_measure  
                WHERE compliance_measure.id IN (${complianceMeasureIds})
            `;

            const query = await db.query(sql, [userId]);

            const count = complianceMeasureIds.split(',').length;
            const databaseCount = parseFloat(query[0]['compliance_measure_count']);

            return count === databaseCount;
        } catch (err) {
            return err;
        }
    }

    async function checkComplianceMeasureIdsStateAccess(complianceMeasureIds, spaceId) {

        try {
            const sql = `
              SELECT COUNT(*) AS compliance_measure_count
              FROM \`space\`
                     INNER JOIN location
                                ON 1 = 1
                                  AND space.location_id = location.id
                     INNER JOIN compliance_measure_applicable
                                ON 1 = 1
                                  AND compliance_measure_applicable.compliance_measure_id IN (${complianceMeasureIds})
                                  AND (location.state = compliance_measure_applicable.state OR compliance_measure_applicable.is_national = 1)
              WHERE 1 = 1
                
                AND space.is_active = 1
                AND location.is_active = 1
                AND location.payment_status != 'Suspended'
                AND space.id = ?
            `;

            const query = await db.query(sql, [spaceId]);

            const count = complianceMeasureIds.split(',').length;
            const databaseCount = parseFloat(query[0]['compliance_measure_count']);

            return count === databaseCount;
        } catch (err) {
            return err;
        }
    }

    async function checkInsertForExistingEntries(complianceMeasureIds,
                                                 spaceId,) {
        try {
            const sql = `
              SELECT COUNT(*) AS compliance_count 
              FROM compliance 
              WHERE 1 = 1 
                AND compliance.space_id = ?
                AND compliance.compliance_measure_id IN (${complianceMeasureIds})
                AND is_active = 1
            `;

            const query = await db.query(sql, [
                spaceId,
            ]);

            const complianceCount = parseFloat(query[0]['compliance_count']);

            return complianceCount === 0;
        } catch (err) {
            return err;
        }
    }

    async function spaceHasCompliance(spaceId) {
        try {
            const sql = `
              SELECT COUNT(*) AS space_count
              FROM compliance a
              WHERE 1 = 1
                AND a.space_id = ?
            `;

            const query = await db.query(sql, [
                spaceId,
            ]);

            const complianceCount = parseFloat(query[0]['space_count']);

            return !(complianceCount === 0);
        } catch (err) {
            return err;
        }
    }

    async function getCompliancesFromSpaceId(spaceId, userId) {
        try {
            const sql = `
              SELECT b.id,
                     c.\`name\` AS measure,
                     d.name     AS category,
                     f.email
              FROM \`space\` a
                     INNER JOIN compliance b
                                ON 1 = 1
                                  AND a.\`id\` = b.\`space_id\`
                     INNER JOIN compliance_measure c
                                ON 1 = 1
                                  AND b.\`compliance_measure_id\` = c.\`id\`
                     INNER JOIN compliance_category d
                                ON 1 = 1
                                  AND c.\`compliance_category_id\` = d.\`id\`
                     LEFT JOIN compliance_contributor_assigned_measures e
                               ON 1 = 1
                                 AND e.compliance_id = b.id
                     LEFT JOIN \`user\` f
                               ON 1 = 1
                                 AND e.user_id = f.id
                                 AND  f.is_active = 1
              WHERE 1 = 1
                AND a.\`id\` = ?

                AND  a.is_active = 1
                AND  b.is_active = 1
                
            `;

            const historyTransaction = transaction.getHistoryTransactionFragment(userId, 'Viewed', 'Compliance Config');
            const viewTransaction = transaction.buildTransactionFragment(sql, [spaceId]);

            const query = await db.queryTransaction([historyTransaction, viewTransaction]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getNonCheckedMeasuresByComplianceCategory(complianceCategoryId, spaceId) {
        try {
            const sql = `
              SELECT a.id,
                     a.\`name\` AS measure,
                     a.frequency_type,
                     a.frequency_unit
              FROM compliance_measure a
                     INNER JOIN compliance_measure_applicable b
                                ON 1 = 1
                                  AND a.\`id\` = b.\`compliance_measure_id\`
                                  AND (b.\`state\` = (
                                    SELECT state
                                    FROM location a
                                           INNER JOIN \`space\` b
                                                      ON 1 = 1
                                                        AND a.\`id\` = b.location_id
                                                        AND b.\`id\` = ?
                                                        AND b.is_active = 1
                                                        AND a.is_active = 1
                                                        AND a.payment_status != 'Suspended'
                                  ) OR b.\`is_national\` = 1)
                     LEFT JOIN compliance c
                               ON 1 = 1
                                 AND c.\`compliance_measure_id\` = a.\`id\`
                                 AND c.\`space_id\` = ?
                                 AND c.is_active = 1

              WHERE 1 = 1
                AND a.\`compliance_category_id\` = ?
                AND (a.\`id\` NOT IN (c.\`compliance_measure_id\`) OR c.\`id\` IS NULL)

            `;

            const query = await db.query(sql, [
                spaceId,
                spaceId,
                complianceCategoryId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getCompaniesWithSpaces(userId, userType) {
        try {

            let sql = '';

            if (userType === 'Administrator' || userType === 'Account Holder' ) {
                sql = `
                  SELECT b.\`id\`,
                         b.\`name\`
                  FROM \`account_holder_assigned_company\` a
                         INNER JOIN company b
                                    ON 1 = 1
                                      AND a.\`company_id\` = b.\`id\`
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND c.company_id = b.id
                         INNER JOIN \`space\` d
                                    ON 1 = 1
                                      AND d.location_id = c.id
                  WHERE 1 = 1
                    AND a.\`user_id_assignee\` = ?
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'                
                  GROUP BY b.id
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT b.\`id\`,
                         b.\`name\`
                  FROM \`reviewer_assigned_company\` a
                         INNER JOIN company b
                                    ON 1 = 1
                                      AND a.\`company_id\` = b.\`id\`
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND c.company_id = b.id
                         INNER JOIN \`space\` d
                                    ON 1 = 1
                                      AND d.location_id = c.id
                  WHERE 1 = 1
                    AND a.\`user_id_assignee\` = ?
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                  GROUP BY b.id
                `;
            }

            if (userType === 'Manager') {
                sql = `
                  SELECT d.\`id\`,
                         d.\`name\`
                  FROM \`manager_assigned_location\` a
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND a.location_id = c.id
                         INNER JOIN company d
                                    ON 1 = 1
                                      AND c.company_id = d.id
                  WHERE 1 = 1
                    AND a.\`user_id_assignee\` = ?
                    AND a.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                  GROUP BY d.id
                `;
            }

            const query = await db.query(sql, [userId]);

            console.log(query);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getLocationsWithSpaces(userId, companyId, userType) {
        try {
            let sql = `
              SELECT c.\`id\`,
                     c.\`name\`
              FROM \`account_holder_assigned_company\` a
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN location c
                                ON 1 = 1
                                  AND c.company_id = b.id
                     INNER JOIN \`space\` d
                                ON 1 = 1
                                  AND d.location_id = c.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?
                AND b.\`id\` = ?
                AND c.payment_status != 'Suspended'
              GROUP BY c.id
            `;

            if (userType === 'Manager') {
                console.log('HERE');
                sql = `
                  SELECT c.\`id\`,
                         c.\`name\`
                  FROM \`manager_assigned_location\` a
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND a.location_id = c.id
                  WHERE 1 = 1
                    AND a.\`user_id_assignee\` = ?
                    AND c.\`company_id\` = ?
                    AND c.payment_status != 'Suspended'
                  GROUP BY c.id
                `;
            }

            const query = await db.query(sql, [userId, companyId]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getLocationTypesWithCompanies(userId, companyId, userType) {
        try {

            let sql = '';

            if (userType === 'Administrator' || userType === 'Account Holder' ) {
                sql = `
                  SELECT d.id,
                         d.name
                  FROM account_holder_assigned_company a
                         INNER JOIN company b
                                    ON 1 = 1
                                      AND a.company_id = b.id
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND c.company_id = b.id
                         INNER JOIN location_type d
                                    ON 1 = 1
                                      AND c.location_type_id = d.id
                         INNER JOIN \`space\` s 
                                    ON 1 = 1
                                      AND c.id = s.location_id
                  WHERE 1 = 1
                    AND a.user_id_assignee = ?
                    
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND c.payment_status != 'Suspended'
                    AND b.id = ?
                  GROUP BY d.id
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT d.id,
                         d.name
                  FROM reviewer_assigned_company a
                         INNER JOIN company b
                                    ON 1 = 1
                                      AND a.company_id = b.id
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND c.company_id = b.id
                         INNER JOIN location_type d
                                    ON 1 = 1
                                      AND c.location_type_id = d.id
                  WHERE 1 = 1
                    AND a.user_id_assignee = ?

                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND c.payment_status != 'Suspended'
                    AND b.id = ?
                  GROUP BY d.id
                `;
            }

            if (userType === 'Manager') {
                sql = `
                  SELECT d.id,
                         d.name
                  FROM manager_assigned_location a
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND a.location_id = c.id
                         INNER JOIN location_type d
                                    ON 1 = 1
                                      AND c.location_type_id = d.id
                  WHERE 1 = 1
                    AND a.user_id_assignee = ?

                    AND a.is_active = 1
                    AND c.is_active = 1
                    AND c.payment_status != 'Suspended'
                    AND c.company_id = ?
                  GROUP BY d.id
                `;
            }


            const query = await db.query(sql, [userId, companyId], 1);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getSpacesByLocation(userId, locationId, userType) {
        try {

            let sql = '';

            if (userType === 'Administrator' || userType === 'Account Holder' ) {
                sql = `
                  SELECT d.\`id\`,
                         d.\`name\`
                  FROM \`account_holder_assigned_company\` a
                         INNER JOIN company b
                                    ON 1 = 1
                                      AND a.\`company_id\` = b.\`id\`
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND c.company_id = b.id
                         INNER JOIN \`space\` d
                                    ON 1 = 1
                                      AND d.location_id = c.id
                  WHERE 1 = 1
                    AND a.\`user_id_assignee\` = ?
                    AND c.\`id\` = ?
                  
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                  GROUP BY d.id
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT d.\`id\`,
                         d.\`name\`
                  FROM \`reviewer_assigned_company\` a
                         INNER JOIN company b
                                    ON 1 = 1
                                      AND a.\`company_id\` = b.\`id\`
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND c.company_id = b.id
                         INNER JOIN \`space\` d
                                    ON 1 = 1
                                      AND d.location_id = c.id
                  WHERE 1 = 1
                    AND a.\`user_id_assignee\` = ?


                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                    AND c.\`id\` = ?
                  GROUP BY d.id
                `;
            }

            if (userType === 'Manager') {
                sql = `
                  SELECT d.\`id\`,
                         d.\`name\`
                  FROM \`manager_assigned_location\` a
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND a.location_id = c.id
                         INNER JOIN \`space\` d
                                    ON 1 = 1
                                      AND d.location_id = c.id
                  WHERE 1 = 1
                    AND a.\`user_id_assignee\` = ?

                    AND a.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                    AND c.\`id\` = ?
                  GROUP BY d.id
                `;
            }

            const query = await db.query(sql, [userId, locationId]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getAttachableComplianceCategories(userId, locationId, userType) {
        try {
            let sql = '';

            if (userType === 'Administrator' || userType === 'Account Holder' ) {
                sql = `
                  SELECT e.id,
                         e.name
                  FROM location a
                         INNER JOIN account_holder_assigned_company b
                                    ON 1 = 1
                                      AND a.company_id = b.company_id
                         INNER JOIN compliance_measure_applicable c
                                    ON 1 = 1
                                      AND (a.state = c.state OR c.is_national = 1)
                         INNER JOIN compliance_measure d
                                    ON 1 = 1
                                      AND c.compliance_measure_id = d.id
                         INNER JOIN compliance_category e
                                    ON 1 = 1
                                      AND d.compliance_category_id = e.id
                  WHERE 1 = 1
                    AND b.user_id_assignee = ?
                    AND a.id = ?
                    AND a.payment_status != 'Suspended'
                  GROUP BY e.id
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT e.id,
                         e.name
                  FROM location a
                         INNER JOIN reviewer_assigned_company b
                                    ON 1 = 1
                                      AND a.company_id = b.company_id
                         INNER JOIN compliance_measure_applicable c
                                    ON 1 = 1
                                      AND (a.state = c.state OR c.is_national = 1)
                         INNER JOIN compliance_measure d
                                    ON 1 = 1
                                      AND c.compliance_measure_id = d.id
                         INNER JOIN compliance_category e
                                    ON 1 = 1
                                      AND d.compliance_category_id = e.id
                  WHERE 1 = 1
                    AND b.user_id_assignee = ?
                    AND a.id = ?
                    AND a.payment_status != 'Suspended'
                  GROUP BY e.id
                `;
            }

            if (userType === 'Manager') {
                sql = `
                  SELECT e.id,
                         e.name
                  FROM manager_assigned_location a
                         INNER JOIN location b
                                    ON 1 = 1
                                      AND a.location_id = b.id
                         INNER JOIN compliance_measure_applicable c
                                    ON 1 = 1
                                      AND (b.state = c.state OR c.is_national = 1)
                         INNER JOIN compliance_measure d
                                    ON 1 = 1
                                      AND c.compliance_measure_id = d.id
                         INNER JOIN compliance_category e
                                    ON 1 = 1
                                      AND d.compliance_category_id = e.id
                  WHERE 1 = 1
                    AND a.user_id_assignee = ?
                    AND a.location_id = ?
                    AND b.payment_status != 'Suspended'
                  GROUP BY e.id
                `;
            }

            const query = await db.query(sql, [userId, locationId]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function locationTypeByCompanyIdHasSpaces(userId, companyId, locationTypeId, userType) {
        try {


            let sql = '';

            let otherOverrideCondition = '';

            if (locationTypeId === "other") {
                locationTypeId = 1;
                otherOverrideCondition = "OR 1 = 1"
            }

            if (userType === 'Administrator' || userType === 'Account Holder' ) {
                sql = `
                  SELECT COUNT(*) AS spaces_count
                  FROM location a
                         INNER JOIN account_holder_assigned_company b
                                    ON 1 = 1
                                      AND a.company_id = b.company_id
                         INNER JOIN location_type c
                                    ON 1 = 1
                                      AND c.id = a.location_type_id
                         INNER JOIN \`space\` d 
                                    ON 1 = 1
                                      AND d.location_id = a.id
                  WHERE 1 = 1
                    AND b.user_id_assignee = ?
                    AND (c.id = ? ${otherOverrideCondition})
                    
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND d.is_active = 1
                    AND a.payment_status != 'Suspended'
                    AND b.company_id = ?
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT COUNT(*) AS spaces_count
                  FROM location a
                         INNER JOIN reviewer_assigned_company b
                                    ON 1 = 1
                                      AND a.company_id = b.company_id
                         INNER JOIN location_type c
                                    ON 1 = 1
                                      AND c.id = a.location_type_id
                         INNER JOIN \`space\` d 
                                    ON 1 = 1
                                      AND d.location_id = a.id
                  WHERE 1 = 1
                    AND b.user_id_assignee = ?


                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND d.is_active = 1
                    AND a.payment_status != 'Suspended'
                    AND (c.id = ? ${otherOverrideCondition})
                    AND b.company_id = ?
                `;
            }

            if (userType === 'Manager') {
                sql = `
                  SELECT COUNT(*) AS spaces_count
                  FROM location a
                         INNER JOIN manager_assigned_location b
                                    ON 1 = 1
                                      AND a.id = b.location_id
                         INNER JOIN location_type c
                                    ON 1 = 1
                                      AND c.id = a.location_type_id
                         INNER JOIN \`space\` d
                                    ON 1 = 1
                                      AND d.location_id = a.id
                  WHERE 1 = 1
                    AND b.user_id_assignee = ?


                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND d.is_active = 1
                    AND a.payment_status != 'Suspended'
                    AND (c.id = ? ${otherOverrideCondition})
                    AND a.company_id = ?
                `;
            }

            console.log('=============');

            const query = await db.query(sql, [userId, locationTypeId, companyId], 1);
            const spacesCount = parseFloat(query[0]['spaces_count']);

            console.log('=============');

            return spacesCount !== 0;
        } catch (err) {
            return err;
        }
    }

    async function updateComplianceContributor(complianceId, email, currentUser) {
        try {

            const connection = db.getMySQL_connection();
            const promisedQuery = db.getPromisifiedQuery(connection);

            let query = await new Promise((resolve, reject) => {
                connection.beginTransaction(async () => {

                    let userId = '';

                    try {
                        // Check if the user exists yet.
                        let userExists = await promisedQuery(
                            `
                                SELECT 
                                       COUNT(*) AS user_count 
                                FROM \`user\`
                                WHERE 1 = 1
                                  AND email = ?
                            `,
                            [email]
                        );

                        userExists = parseFloat(userExists[0]['user_count']);

                        if (userExists) {
                            // Just fetch the user id.
                            userId = await promisedQuery(`SELECT id FROM \`user\` WHERE email = ?`, [email]);
                            userId = userId[0]['id'];
                        } else {
                            // Create new user and get his ID.
                            const newUser = await promisedQuery(
                                `
                                  INSERT INTO \`user\` (\`username\`,
                                                        \`firstname\`,
                                                        \`lastname\`,
                                                        \`email\`,
                                                        \`password\`,
                                                        \`user_type_id\`,
                                                        \`created_by\`)
                                  VALUES (?, '', '', ?, ?,
                                          (SELECT id FROM user_type WHERE \`name\` = 'Compliance Certifier'),
                                          ?);
                                `,
                                [email, email, email, currentUser]
                            );

                            userId = newUser.insertId;
                        }

                        const alreadExistsSQL = `
                            SELECT 
                                COUNT(*) AS existing 
                            FROM compliance_contributor_assigned_measures a 
                            
                            INNER JOIN \`user\` b 
                                ON 1 = 1
                                    AND a.user_id = b.id 
                                    
                            WHERE 1 = 1
                                AND a.compliance_id IN ( ? )
                                AND b.email = ?
                                AND a.is_active = 1
                                AND b.is_active = 1
                        `;

                        // Base case.
                        const alreadyExists = await promisedQuery(alreadExistsSQL, [complianceId, email]);

                        if (parseFloat(alreadyExists[0]['existing']) == complianceId.length) {
                            return resolve(connection.commit());
                        }

                        // Set current assigned compliance to be non-active (this will serve as our log)
                        await promisedQuery(
                            `
                                UPDATE compliance_contributor_assigned_measures
                                   SET is_active = 0,
                                       last_updated = NOW(),
                                       updated_by = ?
                                WHERE compliance_id IN ( ? )
                            `,
                            [currentUser, complianceId]
                        );

                        // Add new active record.
                        complianceId.forEach(async id => {
                            await promisedQuery(
                                `
                              INSERT INTO compliance_contributor_assigned_measures (compliance_id, user_id, created_by, is_active)
                              VALUES (?, ?, ?, 1);
                            `,
                                [id, userId, currentUser]
                            );
                        })


                        // Commit query.
                        resolve(connection.commit());
                    } catch (errors) {
                        connection.rollback();
                        reject(errors);
                        console.log('omg has errors');
                        console.log(errors);
                    }
                });
            });

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getLocationsFromLocationTypeWithSpaces(userId, companyId, locationTypeId, userType) {

        try {
            let sql = '';

            let overrideOtherCondition = '';

            if (locationTypeId === "other") {
                overrideOtherCondition = "OR 1 = 1";
            }

            if (userType === 'Administrator' || userType === 'Account Holder' ) {
                sql = `
                  SELECT a.id,
                         a.name
                  FROM location a
                         INNER JOIN account_holder_assigned_company b
                                    ON 1 = 1
                                      AND a.company_id = b.company_id
                         INNER JOIN location_type c
                                    ON 1 = 1
                                      AND c.id = a.location_type_id
                         INNER JOIN \`space\` d 
                                    ON 1 = 1
                                      AND d.location_id = a.id
                  WHERE 1 = 1
                    AND b.user_id_assignee = ?
                    AND (c.id = ? ${overrideOtherCondition})

                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND d.is_active = 1
                    AND a.payment_status != 'Suspended'
                    AND b.company_id = ?
                  GROUP BY a.id
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT a.id,
                         a.name
                  FROM location a
                         INNER JOIN reviewer_assigned_company b
                                    ON 1 = 1
                                      AND a.company_id = b.company_id
                         INNER JOIN location_type c
                                    ON 1 = 1
                                      AND c.id = a.location_type_id
                         INNER JOIN \`space\` d 
                                    ON 1 = 1
                                      AND d.location_id = a.id
                  WHERE 1 = 1
                    AND b.user_id_assignee = ?
                    AND (c.id = ? ${overrideOtherCondition})

                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND d.is_active = 1
                    AND a.payment_status != 'Suspended'
                    AND b.company_id = ?
                  GROUP BY a.id
                `;
            }

            if (userType === 'Manager') {
                sql = `
                  SELECT a.id,
                         a.name
                  FROM location a
                         INNER JOIN manager_assigned_location b
                                    ON 1 = 1
                                      AND a.id = b.location_id
                         INNER JOIN location_type c
                                    ON 1 = 1
                                      AND c.id = a.location_type_id
                         INNER JOIN \`space\` d
                                    ON 1 = 1
                                      AND d.location_id = a.id
                  WHERE 1 = 1
                    AND b.user_id_assignee = ?
                    AND (c.id = ? ${overrideOtherCondition})


                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND d.is_active = 1
                    AND a.payment_status != 'Suspended'
                    AND a.company_id = ?
                  GROUP BY a.id
                `;
            }

            const query = await db.query(sql, [userId, locationTypeId, companyId]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function getDependencies(complianceId) {
        try {
            let sql = `
                SELECT
                  compliance_measure.name
                FROM compliance 
                
                INNER JOIN compliance_measure
                  ON 1 = 1
                    AND compliance.compliance_measure_id = compliance_measure.id
                WHERE 1 = 1
                  AND compliance.id = ?
            `;

            const query = await db.query(sql, [complianceId]);

            return query;
        } catch (err) {
            return err;
        }
    }

    async function validateComplianceIds(complianceIds) {
        try {
            complianceIds = _.uniqBy(complianceIds.split(','));

            const complianceIdsSize = _.size(complianceIds);
            const sql = `
                SELECT 
                      *
                FROM compliance c
                WHERE c.id IN ( ? )
                 AND c.is_active = 1
            `;
            const result = await db.query(sql, [complianceIds]);
            return _.size(result) === complianceIdsSize
        } catch (err) {
            return err;
        }
    }

    async function getComplianceAccessPrivilegeThroughResultDetailId(complianceResultDetailId, userId, userType) {
        try {

            let sql = '';

            if (userType === 'Manager') {
                sql = `
                  SELECT COUNT(*) AS compliance_access
                  FROM compliance a
                         INNER JOIN space b
                                    ON 1 = 1
                                      AND a.space_id = b.id
                         INNER JOIN manager_assigned_location c
                                    ON 1 = 1
                                      AND b.location_id = c.location_id    
                        INNER JOIN compliance_history ch 
                                    ON 1 = 1
                                      AND a.id = ch.compliance_id
                        INNER JOIN compliance_result_detail crd 
                                    ON 1 = 1
                                      AND ch.id = crd.compliance_history_id  
                  WHERE 1 = 1
                    AND c.user_id_assignee = ?
                    AND crd.id = ?
                    
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                `;
            }

            if (userType === 'Administrator' || userType === 'Account Holder' ) {
                sql = `
                  SELECT COUNT(*) AS compliance_access
                  FROM compliance a
                         INNER JOIN space b
                                    ON 1 = 1
                                      AND a.space_id = b.id
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND b.location_id = c.id
                         INNER JOIN account_holder_assigned_company d
                                    ON 1 = 1
                                      AND c.company_id = d.company_id
                                      AND d.user_id_assignee = ?
                        INNER JOIN compliance_history ch 
                                    ON 1 = 1
                                      AND a.id = ch.compliance_id
                        INNER JOIN compliance_result_detail crd 
                                    ON 1 = 1
                                      AND ch.id = crd.compliance_history_id  
                  WHERE 1 = 1
                    AND crd.id = ?

                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT COUNT(*) AS compliance_access
                  FROM compliance a
                         INNER JOIN space b
                                    ON 1 = 1
                                      AND a.space_id = b.id
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND b.location_id = c.id
                         INNER JOIN reviewer_assigned_company d
                                    ON 1 = 1
                                      AND c.company_id = d.company_id
                                      AND d.user_id_assignee = ?
                        INNER JOIN compliance_history ch 
                                    ON 1 = 1
                                      AND a.id = ch.compliance_id
                        INNER JOIN compliance_result_detail crd 
                                    ON 1 = 1
                                      AND ch.id = crd.compliance_history_id  
                  WHERE 1 = 1
                    AND crd.id = ?

                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                `;
            }

            if (userType === 'Compliance Certifier') {
                sql = `
                  SELECT COUNT(b.id) AS compliance_access
                  FROM compliance_contributor_assigned_measures a
                         INNER JOIN compliance b
                                    ON 1 = 1
                                      AND a.compliance_id = b.id
                         INNER JOIN compliance_history ch 
                                    ON 1 = 1
                                      AND b.id = ch.compliance_id
                         INNER JOIN compliance_result_detail crd 
                                    ON 1 = 1
                                      AND ch.id = crd.compliance_history_id  
                  WHERE 1 = 1
                    AND a.user_id = ?
                    AND crd.id = ?

                    AND a.is_active = 1
                    AND b.is_active = 1
                `;
            }

            const query = await db.query(sql, [
                userId,
                complianceResultDetailId,
            ]);

            return query;
        } catch (err) {
            return err;
        }
    }

    return {
        getDependencies: getDependencies,
        getLocationsFromLocationTypeWithSpaces: getLocationsFromLocationTypeWithSpaces,
        locationTypeByCompanyIdHasSpaces: locationTypeByCompanyIdHasSpaces,
        updateComplianceContributor: updateComplianceContributor,
        getNonCheckedMeasuresByComplianceCategory: getNonCheckedMeasuresByComplianceCategory,
        getAttachableComplianceCategories: getAttachableComplianceCategories,
        getCompliancesFromSpaceId: getCompliancesFromSpaceId,
        getCompaniesWithSpaces: getCompaniesWithSpaces,
        getLocationsWithSpaces: getLocationsWithSpaces,
        getLocationTypesWithCompanies: getLocationTypesWithCompanies,
        getSpacesByLocation: getSpacesByLocation,
        spaceHasCompliance: spaceHasCompliance,
        addCompliance: addCompliance,
        checkInsertForExistingEntries: checkInsertForExistingEntries,
        checkComplianceMeasureIdsStateAccess: checkComplianceMeasureIdsStateAccess,
        checkValidComplianceMeasureIds: checkValidComplianceMeasureIds,
        getSpacesCount: getSpacesCount,
        getComplianceCategoriesAndMeasures: getComplianceCategoriesAndMeasures,
        getComplianceFilters: getComplianceFilters,
        getComplianceById: getComplianceById,
        getCompliances: getCompliances,
        getComplianceCategories: getComplianceCategories,
        getComplianceMeasures: getComplianceMeasures,
        updateCompliance: updateCompliance,
        deleteCompliance: deleteCompliance,
        getComplianceAccessPrivilege: getComplianceAccessPrivilege,
        getComplianceAccessPrivilegeThroughResultDetailId: getComplianceAccessPrivilegeThroughResultDetailId,
        validateComplianceIds: validateComplianceIds
    }

})();

module.exports = Service;