var express = require('express'),
    _ = require('lodash'),
    transaction = require('../database/transaction'),
    db = require('../database/database'),
    Utils = require('../../services/utils');

const getManagementCompanies = async function () {
    try {
        const sql = `
            SELECT 
                id 
            FROM management_company 
            WHERE 1 = 1
                AND is_active = 1;
        `;

        return await db.query(sql);
    } catch (errors) {
        return errors;
    }
};

const getPendingItemsPerManagementCompany = async function (managementId, userType) {
    let sql = '';

    if (userType === 'Administrator' || userType === 'Account Holder') {
        sql = `
            SELECT GROUP_CONCAT(email) AS emails,
                     \`data\`            AS items_of_concern
              FROM (SELECT email,
                           GROUP_CONCAT(
                               DISTINCT (
                             CONCAT(days_due, '<->', \`name\`, '<->', \`status\`)
                             )
                               SEPARATOR '<-->') AS \`data\`
                    FROM (SELECT id,
                                 \`name\`,
                                 CAST(\`status\` AS CHAR) AS \`status\`,
                                 ABS(days_due) AS days_due,
                                 email
                          FROM (SELECT e.id,
                                       cm.name,
                                       CASE
                                         WHEN (
                                           DATEDIFF(a.due_for_checking, NOW()) BETWEEN 0
                                             AND 30
                                           )
                                           THEN 'Due Soon'
                                         WHEN (a.due_for_checking <= NOW())
                                           THEN 'Overdue'
                                         ELSE 'Ok'
                                         END                               AS \`status\`,
                                       DATEDIFF(a.due_for_checking, NOW()) AS days_due,
                                       d.email
                                FROM compliance a
                                       INNER JOIN compliance_measure cm
                                                  ON 1 = 1
                                                    AND a.compliance_measure_id = cm.id
                                       INNER JOIN \`space\` b
                                                  ON 1 = 1
                                                    AND a.\`space_id\` = b.\`id\`
                                                    AND b.is_active = 1
                                       INNER JOIN location lc
                                                  ON 1 = 1
                                                    AND b.location_id = lc.id
                                                    AND lc.is_active = 1
                                                    AND lc.payment_status != 'Suspended'
                                       INNER JOIN \`account_holder_assigned_company\` c
                                                  ON 1 = 1
                                                    AND c.\`company_id\` = lc.\`company_id\`
                                                    AND c.is_active = 1
                                       INNER JOIN \`user\` d
                                                  ON 1 = 1
                                                    AND c.\`user_id_assignee\` = d.\`id\`
                                                    AND d.\`management_company_id\` = ?
                                                    AND d.is_active = 1
                                       INNER JOIN user_type e
                                                  ON 1 = 1
                                                    AND d.\`user_type_id\` = e.\`id\`
                                                    AND ( e.name = 'Administrator' OR e.name = 'Account Holder')
                                WHERE 1 = 1
                                  AND a.is_active = 1
                                GROUP BY a.id,
                                         d.email
                                ORDER BY days_due ASC) AS a) AS a
                    WHERE 1 = 1
                      AND a.status != 'Ok'
                    GROUP BY email) AS a
              GROUP BY \`data\`
        `;
    }

    if (userType === 'Reviewer') {
        sql = `
            SELECT GROUP_CONCAT(email) AS emails,
                     \`data\`            AS items_of_concern
              FROM (SELECT email,
                           GROUP_CONCAT(
                               DISTINCT (
                             CONCAT(days_due, '<->', \`name\`, '<->', \`status\`)
                             )
                               SEPARATOR '<-->') AS \`data\`
                    FROM (SELECT id,
                                 \`name\`,
                                 CAST(\`status\` AS CHAR) AS \`status\`,
                                 ABS(days_due) AS days_due,
                                 email
                          FROM (SELECT e.id,
                                       cm.name,
                                       CASE
                                         WHEN (
                                           DATEDIFF(a.due_for_checking, NOW()) BETWEEN 0
                                             AND 30
                                           )
                                           THEN 'Due Soon'
                                         WHEN (a.due_for_checking <= NOW())
                                           THEN 'Overdue'
                                         ELSE 'Ok'
                                         END                               AS \`status\`,
                                       DATEDIFF(a.due_for_checking, NOW()) AS days_due,
                                       d.email
                                FROM compliance a
                                       INNER JOIN compliance_measure cm
                                                  ON 1 = 1
                                                    AND a.compliance_measure_id = cm.id
                                       INNER JOIN \`space\` b
                                                  ON 1 = 1
                                                    AND a.\`space_id\` = b.\`id\`
                                                    AND b.is_active = 1
                                       INNER JOIN location lc
                                                  ON 1 = 1
                                                    AND b.location_id = lc.id
                                                    AND lc.is_active = 1
                                                    AND lc.payment_status != 'Suspended'
                                       INNER JOIN \`reviewer_assigned_company\` c
                                                  ON 1 = 1
                                                    AND c.\`company_id\` = lc.\`company_id\`
                                                    AND c.is_active = 1
                                       INNER JOIN \`user\` d
                                                  ON 1 = 1
                                                    AND c.\`user_id_assignee\` = d.\`id\`
                                                    AND d.\`management_company_id\` = ?
                                                    AND d.is_active = 1
                                       INNER JOIN user_type e
                                                  ON 1 = 1
                                                    AND d.\`user_type_id\` = e.\`id\`
                                                    AND e.name = 'Reviewer'
                                WHERE 1 = 1
                                  AND a.is_active = 1
                                GROUP BY a.id,
                                         d.email
                                ORDER BY days_due ASC) AS a) AS a
                    WHERE 1 = 1
                      AND a.status != 'Ok'
                    GROUP BY email) AS a
              GROUP BY \`data\`
        `;
    }

    if (userType === 'Manager') {
        sql = `
            SELECT GROUP_CONCAT(email) AS emails,
                     \`data\`            AS items_of_concern
              FROM (SELECT email,
                           GROUP_CONCAT(
                               DISTINCT (
                             CONCAT(days_due, '<->', \`name\`, '<->', \`status\`)
                             )
                               SEPARATOR '<-->') AS \`data\`
                    FROM (SELECT id,
                                 \`name\`,
                                 CAST(\`status\` AS CHAR) AS \`status\`,
                                 ABS(days_due)            AS days_due,
                                 email
                          FROM (SELECT e.id,
                                       cm.name,
                                       CASE
                                         WHEN (
                                           DATEDIFF(a.due_for_checking, NOW()) BETWEEN 0
                                             AND 30
                                           )
                                           THEN 'Due Soon'
                                         WHEN (a.due_for_checking <= NOW())
                                           THEN 'Overdue'
                                         ELSE 'Ok'
                                         END                               AS \`status\`,
                                       DATEDIFF(a.due_for_checking, NOW()) AS days_due,
                                       d.email
                                FROM compliance a
                                       INNER JOIN compliance_measure cm
                                                  ON 1 = 1
                                                    AND a.compliance_measure_id = cm.id
                                       INNER JOIN \`space\` b
                                                  ON 1 = 1
                                                    AND a.\`space_id\` = b.\`id\`
                                                    AND b.is_active = 1
                                       INNER JOIN manager_assigned_location c
                                                  ON 1 = 1
                                                    AND b.\`location_id\` = c.\`location_id\`
                                                    AND c.is_active = 1
                                       INNER JOIN \`user\` d
                                                  ON 1 = 1
                                                    AND c.\`user_id_assignee\` = d.\`id\`
                                                    AND d.\`management_company_id\` = ?
                                                    AND d.is_active = 1
                                       INNER JOIN user_type e
                                                  ON 1 = 1
                                                    AND d.\`user_type_id\` = e.\`id\`
                                                    AND e.name = 'Manager'
                                WHERE 1 = 1
                                  AND a.is_active = 1
                                GROUP BY a.id, d.email
                                ORDER BY days_due ASC) AS a
                          WHERE 1 = 1
                            AND a.status != 'Ok') AS a
                    GROUP BY email) AS a  
        `;
    }

    if (userType === 'Compliance Certifier') {
        sql = `
            SELECT GROUP_CONCAT(email) AS emails,
                     \`data\`            AS items_of_concern
              FROM (SELECT email,
                           GROUP_CONCAT(
                               DISTINCT (
                             CONCAT(days_due, '<->', \`name\`, '<->', \`status\`)
                             )
                               SEPARATOR '<-->') AS \`data\`
                    FROM (SELECT id,
                                 \`name\`,
                                 CAST(\`status\` AS CHAR) AS \`status\`,
                                 ABS(days_due)            AS days_due,
                                 email
                          FROM (SELECT e.id,
                                       cm.name,
                                       CASE
                                         WHEN (
                                           DATEDIFF(a.due_for_checking, NOW()) BETWEEN 0
                                             AND 30
                                           )
                                           THEN 'Due Soon'
                                         WHEN (a.due_for_checking <= NOW())
                                           THEN 'Overdue'
                                         ELSE 'Ok'
                                         END                               AS \`status\`,
                                       DATEDIFF(a.due_for_checking, NOW()) AS days_due,
                                       d.email
                                FROM compliance a
                                       INNER JOIN compliance_measure cm
                                                  ON 1 = 1
                                                    AND a.compliance_measure_id = cm.id
                                       INNER JOIN compliance_contributor_assigned_measures c
                                                  ON 1 = 1
                                                    AND a.\`id\` = c.\`compliance_id\`
                                                    AND c.is_active = 1
                                       INNER JOIN \`user\` d
                                                  ON 1 = 1
                                                    AND c.\`user_id\` = d.\`id\`
                                                    AND d.\`management_company_id\` = ?
                                                    AND d.is_active = 1
                                       INNER JOIN user_type e
                                                  ON 1 = 1
                                                    AND d.\`user_type_id\` = e.\`id\`
                                                    AND e.name = 'Compliance Certifier'
                                WHERE 1 = 1
                                  AND a.is_active = 1
                                GROUP BY a.id, d.email
                                ORDER BY days_due ASC) AS a
                          WHERE 1 = 1
                            AND a.status != 'Ok') AS a
                    GROUP BY email) AS a  
        `;
    }

    // console.log(sql.replace('?', managementId).replace('?', userType));

    try {
        return await db.query(sql, [managementId, userType]);
    } catch (e) {
        return e;
    }


};

module.exports = {
    getManagementCompanies: getManagementCompanies,
    getPendingItemsPerManagementCompany: getPendingItemsPerManagementCompany,
};