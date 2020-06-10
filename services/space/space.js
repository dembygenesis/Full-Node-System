var express = require('express'),
    _ = require('lodash'),
    db = require('../database/database'),
    Utils = require('../../services/utils');

const Service = (function () {


    async function updateSpace(spaceId, locationId, name, description) {

        const sql = `
          UPDATE
            \`space\` a
          SET a.location_id = ?,
              a.name        = ?,
              a.description = ?
          WHERE a.id = ?;
        `;

        try {
            const query = await db.query(sql, [locationId, name, description, spaceId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function addSpace(locationId, name, description, userId) {

        const sql = `
          INSERT INTO \`space\` (location_id,
                                 name,
                                 created_by,
                                 description, 
                                 next_invoice_date,
                                 billing_schedule)
          VALUES (?,
                  ?,
                  ?,
                  ?,
                  LAST_DAY(CURDATE()),
                  'TRIAL'
                  );
        `;

        try {
            const query = await db.query(sql, [locationId, name, userId, description]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function deleteSpace(spaceId, userId) {

        /*const sql = `
          DELETE
          FROM \`space\`
          WHERE id = ?
        `;*/

        const sql = `
          UPDATE \`space\`
          SET is_active = 0,
              last_updated = NOW(),
              updated_by = ?
          WHERE id = ?
        `;

        try {
            const query = await db.query(sql, [userId, spaceId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getSpaceById(spaceId) {

        const sql = `
          SELECT a.*
          FROM \`space\` a
          WHERE 1 = 1
            AND a.id = ?
        `;

        try {
            const query = await db.query(sql, [spaceId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getSpaces(userId, userType) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT a.id,
                     a.name,
                     d.name AS company,
                     b.name AS location,
                     a.description
              FROM space a
                     INNER JOIN location b
                                ON 1 = 1
                                  AND a.location_id = b.id
                     INNER JOIN account_holder_assigned_company c
                                ON 1 = 1
                                  AND c.company_id = b.company_id
                                  AND c.user_id_assignee = ?
                     INNER JOIN company d
                                ON 1 = 1
                                  AND c.company_id = d.id
              WHERE 1 = 1
                
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND b.payment_status != 'Suspended'
              GROUP BY a.id
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT a.id,
                     a.name,
                     d.name AS company,
                     b.name AS location,
                     a.description
              FROM space a
                     INNER JOIN location b
                                ON 1 = 1
                                  AND a.location_id = b.id
                     INNER JOIN reviewer_assigned_company c
                                ON 1 = 1
                                  AND c.company_id = b.company_id
                                  AND c.user_id_assignee = ?
                     INNER JOIN company d
                                ON 1 = 1
                                  AND c.company_id = d.id
              WHERE 1 = 1
                
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND b.payment_status != 'Suspended'
              GROUP BY a.id
            `;
        }

        if (userType === 'Manager') {
            sql = `
              SELECT c.id,
                     c.name,
                     d.name AS company,
                     b.name AS location,
                     c.description
              FROM manager_assigned_location a
                     INNER JOIN location b
                                ON 1 = 1
                                  AND a.location_id = b.id
                     INNER JOIN space c
                                ON 1 = 1
                                  AND c.location_id = b.id
                     INNER JOIN company d
                                ON 1 = 1
                                  AND b.company_id = d.id
              WHERE 1 = 1
                AND a.user_id_assignee

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND b.payment_status != 'Suspended'
            `;
        }

        try {
            const query = await db.query(sql, [userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getSpacesByLocationId(userId, locationId, userType) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT a.id,
                     a.name,
                     d.name AS company,
                     b.name AS location,
                     a.description
              FROM space a
                     INNER JOIN location b
                                ON 1 = 1
                                  AND a.location_id = b.id
                                  AND b.id = ?
                                  AND b.is_active = 1
                                  AND b.payment_status != 'Suspended'
                     INNER JOIN account_holder_assigned_company c
                                ON 1 = 1
                                  AND c.company_id = b.company_id
                                  AND c.user_id_assignee = ?
                                  AND c.is_active = 1
                     INNER JOIN company d
                                ON 1 = 1
                                  AND c.company_id = d.id
                                  AND d.is_active = 1
              WHERE 1 = 1
                AND a.is_active = 1
              GROUP BY a.id
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT a.id,
                     a.name,
                     d.name AS company,
                     b.name AS location,
                     a.description
              FROM space a
                     INNER JOIN location b
                                ON 1 = 1
                                  AND a.location_id = b.id
                                  AND b.id = ?
                                  AND b.is_active = 1
                                  AND b.payment_status != 'Suspended'
                     INNER JOIN reviewer_assigned_company c
                                ON 1 = 1
                                  AND c.company_id = b.company_id
                                  AND c.user_id_assignee = ?
                                  AND c.is_active = 1
                     INNER JOIN company d
                                ON 1 = 1
                                  AND c.company_id = d.id
                                  AND d.is_active = 1
              WHERE 1 = 1
                AND a.is_active = 1
              GROUP BY a.id
            `;
        }

        if (userType === 'Manager') {

            sql = `
              SELECT a.id,
                     a.name,
                     d.name AS company,
                     b.name AS location,
                     a.description
              FROM space a
                     INNER JOIN location b
                                ON 1 = 1
                                  AND a.location_id = b.id
                                  AND b.is_active = 1
                                  AND b.payment_status != 'Suspended'
                     INNER JOIN manager_assigned_location c
                                ON 1 = 1
                                  AND c.location_id = b.id
                                  AND c.is_active = 1
                     INNER JOIN company d
                                ON 1 = 1
                                  AND b.company_id = d.id
                                  AND d.is_active = 1
              WHERE 1 = 1
                AND b.id = ?
                AND c.user_id_assignee = ?
                AND a.is_active = 1
              GROUP BY a.id
            `;
        }

        try {
            const query = await db.query(sql, [locationId, userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getSpaceAccessPrivilege(spaceId, userId, userType) {

        let sql = '';

        if (userType === 'Manager') {
            sql = `
              SELECT COUNT(*) AS space_access
              FROM \`space\` a
                     INNER JOIN manager_assigned_location c
                                ON 1 = 1
                                  AND a.location_id = c.location_id

              WHERE 1 = 1
                AND c.user_id_assignee = ?
                AND a.id = ?
                
                AND a.is_active = 1
                AND c.is_active = 1
            `;
        }

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT COUNT(*) AS space_access
              FROM \`space\` a

                     INNER JOIN location b
                                ON 1 = 1
                                  AND a.location_id = b.id

                     INNER JOIN account_holder_assigned_company c
                                ON 1 = 1
                                  AND b.company_id = c.company_id
                                  AND c.user_id_assignee = ?
              WHERE 1 = 1
                AND a.id = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND b.payment_status != 'Suspended'
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT COUNT(*) AS space_access
              FROM \`space\` a

                     INNER JOIN location b
                                ON 1 = 1
                                  AND a.location_id = b.id

                     INNER JOIN reviewer_assigned_company c
                                ON 1 = 1
                                  AND b.company_id = c.company_id
                                  AND c.user_id_assignee = ?
              WHERE 1 = 1
                AND a.id = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND b.payment_status != 'Suspended'
            `;
        }

        if (userType === 'Compliance Certifier') {
            sql = `
              SELECT 
                COUNT(DISTINCT (c.id)) AS space_access
              FROM compliance_contributor_assigned_measures a
                     INNER JOIN compliance b
                                ON 1 = 1
                                  AND a.compliance_id = b.id
                     INNER JOIN \`space\` c
                                ON 1 = 1
                                  AND b.space_id = c.id
              WHERE 1 = 1
                AND a.user_id = ?
                AND c.id = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
            `;
        }

        try {
            const query = await db.query(sql, [userId, spaceId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getLocationFilters(userId, userType) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT b.*
              FROM location b

                     INNER JOIN account_holder_assigned_company c
                                ON 1 = 1
                                  AND b.company_id = c.company_id
                                  AND c.user_id_assignee = ?
                                  AND c.is_active = 1
              WHERE 1 = 1
                AND b.is_active = 1
                AND b.payment_status != 'Suspended'
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT b.*
              FROM location b
                     INNER JOIN reviewer_assigned_company c
                                ON 1 = 1
                                  AND b.company_id = c.company_id
                                  AND c.user_id_assignee = ?
                                  AND c.is_active = 1
              WHERE 1 = 1
                AND b.is_active = 1
                AND b.payment_status != 'Suspended'
            `;
        }

        if (userType === 'Manager') {
            sql = `
              SELECT b.*
              FROM location b
                     INNER JOIN manager_assigned_location c
                                ON 1 = 1
                                  AND b.id = c.location_id
                                  AND c.is_active = 1
              WHERE 1 = 1
                AND c.user_id_assignee = ?
                AND b.is_active = 1
                AND b.payment_status != 'Suspended'
            `;
        }

        try {
            const query = await db.query(sql, [userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function userHasLocations(userId, userType, managementCompanyId) {

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT COUNT(*) AS location_count
              FROM location b
                     INNER JOIN account_holder_assigned_company c
                                ON 1 = 1
                                  AND b.company_id = c.company_id
                                  AND c.user_id_assignee = ?
              WHERE 1 = 1 
                AND b.is_active = 1
                AND c.is_active = 1
                AND b.payment_status != 'Suspended'

            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT COUNT(*) AS location_count
              FROM location b
                     INNER JOIN reviewer_assigned_company c
                                ON 1 = 1
                                  AND b.company_id = c.company_id
                                  AND c.user_id_assignee = ?
              WHERE 1 = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND b.payment_status != 'Suspended'
            `;
        }

        if (userType === 'Manager') {
            sql = `
              SELECT COUNT(*) AS location_count
              FROM manager_assigned_location b
              WHERE 1 = 1
                AND b.user_id_assignee = ?
                AND b.is_active = 1
            `;
        }

        try {
            const query = await db.query(sql, [userId]);

            const locationCount = parseFloat(query[0]['location_count']);

            return locationCount !== 0;
        } catch (errors) {
            return errors;
        }
    }

    async function getSpacesCount(userId, userType) {
        try {
            let sql = '';

            if (userType === 'Administrator' || userType === 'Account Holder') {
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

    async function getDependencies(spaceId) {
        try {
            let sql = `
                SELECT
                  compliance_measure.name
                FROM \`space\`
                
                INNER JOIN compliance
                  ON 1 = 1 
                    AND space.id = compliance.space_id
                    AND compliance.is_active = 1
  
                INNER JOIN compliance_measure 
                  ON 1 = 1
                    AND compliance.compliance_measure_id = compliance_measure.id

                WHERE 1 = 1
                  AND space.id = ?
            `;

            console.log(sql.replace('?', spaceId));

            const query = await db.query(sql, [spaceId]);

            return query;
        } catch (err) {
            return err;
        }
    }

    return {
        getDependencies: getDependencies,
        getSpacesCount: getSpacesCount,
        getSpacesByLocationId: getSpacesByLocationId,
        userHasLocations: userHasLocations,
        getLocationFilters: getLocationFilters,
        addSpace: addSpace,
        updateSpace: updateSpace,
        deleteSpace: deleteSpace,
        getSpaceAccessPrivilege: getSpaceAccessPrivilege,
        getSpaces: getSpaces,
        getSpaceById: getSpaceById,
    }

})();

module.exports = Service;