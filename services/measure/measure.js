const Service = (function () {

    async function getFilters(userId) {

        // Location -> join company -> join assigned companies
        const sql = `
          SELECT a.\`company_id\`,
                 g.\`name\` AS company_name,
                 b.id       AS location_id,
                 b.\`name\` AS location_name,
                 c.\`id\`   AS space_id,
                 c.name     AS space_name,
                 f.\`id\`   AS compliance_category_id,
                 f.\`name\` AS compliance_category_name,
                 e.\`id\`   AS compliance_measure_id,
                 e.\`name\` AS compliance_measure_name
          FROM account_holder_assigned_company a
                 INNER JOIN location b
                            ON 1 = 1
                              AND a.\`company_id\` = b.\`company_id\`
                 INNER JOIN \`space\` c
                            ON 1 = 1
                              AND b.id = c.\`location_id\`
                 INNER JOIN compliance d
                            ON 1 = 1
                              AND c.\`id\` = d.\`space_id\`
                 INNER JOIN compliance_measure e
                            ON 1 = 1
                              AND d.\`compliance_measure_id\` = e.\`id\`
                 INNER JOIN compliance_category f
                            ON 1 = 1
                              AND e.\`compliance_category_id\` = f.\`id\`
                 INNER JOIN company g
                            ON 1 = 1
                              AND a.\`company_id\` = g.\`id\`
          WHERE 1 = 1
            AND b.payment_status != 'Suspended'
            AND a.\`user_id_assignee\` = 231
        `;

        try {
            const query = await db.query(sql, [userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getCompaniesWithAccess(userId, userType) {

        let sql = '';

        if (userType === 'Manager') {
            sql = `
              SELECT b.id,
                     b.name
              FROM manager_assigned_location a
                     INNER JOIN location c
                                ON 1 = 1
                                  AND a.location_id = c.id
                     INNER JOIN company b
                                ON 1 = 1
                                  AND c.company_id = b.id
              WHERE 1 = 1
                AND a.user_id_assignee = ?
                
                AND a.is_active = 1
                AND c.is_active = 1
                AND b.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP BY b.id
            `;
        }


        if (userType === 'Administrator' || userType === 'Account Holder') {
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
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND e.space_id = d.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?


                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
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
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND e.space_id = d.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP BY b.id
            `;
        }

        if (userType === 'Compliance Certifier') {
            sql = `
              SELECT e.\`id\`,
                     e.\`name\`
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
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND d.payment_status != 'Suspended'
              GROUP BY e.id
            `;
        }

        try {
            const query = await db.query(sql, [userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getLocationsWithAccess(companyId, userId, userType) {

        let sql = '';

        if (userType === 'Manager') {
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
              
                AND a.is_active = 1
                AND c.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP BY c.id
            `;
        }

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
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
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND e.space_id = d.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?
                AND b.\`id\` = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP BY c.id
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT c.\`id\`,
                     c.\`name\`
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
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND e.space_id = d.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?
                AND b.\`id\` = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP BY c.id
            `;
        }

        if (userType === 'Compliance Certifier') {
            sql = `
              SELECT d.\`id\`,
                     d.\`name\`
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
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND d.payment_status != 'Suspended'
              GROUP BY d.id
            `;
        }

        try {
            const query = await db.query(sql, [userId, companyId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getSpacesWithAccess(locationId, userId, userType) {

        let sql = '';

        if (userType === 'Manager') {
            sql = `
              SELECT d.\`id\`,
                     d.\`name\`
              FROM \`manager_assigned_location\` a
                     INNER JOIN \`space\` d
                                ON 1 = 1
                                  AND d.location_id = a.location_id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?
                AND a.\`location_id\` = ?
                
                AND a.is_active = 1
                AND d.is_active = 1
              GROUP BY d.id
            `;
        }

        if (userType === 'Administrator' || userType === 'Account Holder') {
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
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND e.space_id = d.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?
                AND c.\`id\` = ?
                
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
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
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND e.space_id = d.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?
                AND c.\`id\` = ?
                
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP BY d.id
            `;
        }

        if (userType === 'Compliance Certifier') {
            sql = `
              SELECT c.\`id\`,
                     c.\`name\`
              FROM compliance_contributor_assigned_measures a
                     INNER JOIN compliance b
                                ON 1 = 1
                                  AND a.compliance_id = b.id
                     INNER JOIN \`space\` c
                                ON 1 = 1
                                  AND b.space_id = c.id
              WHERE 1 = 1
                AND a.user_id = ?
                AND c.location_id = ?
                
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
              GROUP BY c.id
            `;
        }

        try {
            const query = await db.query(sql, [userId, locationId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getComplianceCategoriesWithAccess(spaceId, userId, userType) {

        let sql = '';

        if (userType === 'Manager') {
            sql = `
              SELECT g.\`id\`,
                     g.\`name\`
              FROM \`manager_assigned_location\` a
                     INNER JOIN \`space\` d
                                ON 1 = 1
                                  AND a.\`location_id\` = d.\`location_id\`
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND d.id = e.space_id
                     INNER JOIN compliance_measure f
                                ON 1 = 1
                                  AND e.compliance_measure_id = f.id
                     INNER JOIN compliance_category g
                                ON 1 = 1
                                  AND f.compliance_category_id = g.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?
                AND d.id = ?
              
                AND a.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
              
              GROUP by g.id
            `;
        }

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT g.\`id\`,
                     g.\`name\`
              FROM \`account_holder_assigned_company\` a
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN location c
                                ON 1 = 1
                                  AND c.\`company_id\` = b.\`id\`
                     INNER JOIN \`space\` d
                                ON 1 = 1
                                  AND d.\`location_id\` = c.\`id\`
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND d.id = e.space_id
                     INNER JOIN compliance_measure f
                                ON 1 = 1
                                  AND e.compliance_measure_id = f.id
                     INNER JOIN compliance_category g
                                ON 1 = 1
                                  AND f.compliance_category_id = g.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?
                AND d.id = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP by g.id
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT g.\`id\`,
                     g.\`name\`
              FROM \`reviewer_assigned_company\` a
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN location c
                                ON 1 = 1
                                  AND c.\`company_id\` = b.\`id\`
                     INNER JOIN \`space\` d
                                ON 1 = 1
                                  AND d.\`location_id\` = c.\`id\`
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND d.id = e.space_id
                     INNER JOIN compliance_measure f
                                ON 1 = 1
                                  AND e.compliance_measure_id = f.id
                     INNER JOIN compliance_category g
                                ON 1 = 1
                                  AND f.compliance_category_id = g.id
              WHERE 1 = 1
                AND a.\`user_id_assignee\` = ?
                AND d.id = ?

                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP by g.id
            `;
        }

        if (userType === 'Compliance Certifier') {
            sql = `
              SELECT g.\`id\`,
                     g.\`name\`
              FROM compliance_contributor_assigned_measures a
                     INNER JOIN compliance b
                                ON 1 = 1
                                  AND a.compliance_id = b.id
                     INNER JOIN compliance_measure f
                                ON 1 = 1
                                  AND b.compliance_measure_id = f.id
                     INNER JOIN compliance_category g
                                ON 1 = 1
                                  AND f.compliance_category_id = g.id
              WHERE 1 = 1
                AND a.user_id = ?
                AND b.space_id = ?

                AND a.is_active = 1
                AND b.is_active = 1
              
              GROUP BY g.id
            `;
        }

        try {
            const query = await db.query(sql, [userId, spaceId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getComplianceMeasures(userId,
                                         companyId,
                                         locationId,
                                         spaceId,
                                         complianceCategoryId,
                                         userType,) {

        let conditions = '';

        if (userType === 'Administrator' || userType === 'Reviewer' || userType === 'Account Holder') {
            conditions = `
                AND a.company_id = ${companyId}
                AND c.id = ${locationId}
            `;

            if (typeof spaceId !== "undefined") {
                conditions += ` AND d.id = ${spaceId} `;
            }

            if (typeof complianceCategoryId !== "undefined") {
                conditions += ` AND g.id = ${complianceCategoryId} `;
            }
        }

        if (userType === 'Manager') {
            conditions = `
                AND c.company_id = ${companyId}
                AND a.location_id = ${locationId}
            `;

            if (typeof spaceId !== "undefined") {
                conditions += ` AND d.id = ${spaceId} `;
            }

            if (typeof complianceCategoryId !== "undefined") {
                conditions += ` AND g.id = ${complianceCategoryId} `;
            }
        }

        if (userType === 'Compliance Certifier') {
            conditions = `
                AND b.id = ${companyId}
                AND c.id = ${locationId}
            `;

            if (typeof spaceId !== "undefined") {
                conditions += ` AND e.space_id = ${spaceId} `;
            }

            if (typeof complianceCategoryId !== "undefined") {
                conditions += ` AND g.id = ${complianceCategoryId} `;
            }
        }

        let sql = '';

        if (userType === 'Manager') {
            sql = `
              SELECT e.id,
                     f.\`name\`                                  AS measure,
                     g.name                                      AS compliance_category,
                     CONCAT(
                         'every ',
                         f.\`frequency_unit\`,
                         ' ',
                         h.\`name\`,
                         IF(f.frequency_unit > 1, 's', '')
                       )                                         AS frequency,
                     CASE
                       WHEN (
                         DATEDIFF(e.\`due_for_checking\`, NOW()) BETWEEN 0 AND 30
                         )
                         THEN 'Due Soon'
                       WHEN (e.\`due_for_checking\` <= NOW())
                         THEN 'Overdue'
                       ELSE 'Ok'
                       END                                       AS \`status\`,
                     DATE_FORMAT(e.due_for_checking, '%d-%m-%Y') AS due,
                     d.name as space_name,
                     d.id as space_id
              FROM \`manager_assigned_location\` a
                    INNER JOIN \`location\` c
                                ON 1 = 1
                                  AND a.\`location_id\` = c.id
                     INNER JOIN \`space\` d
                                ON 1 = 1
                                  AND a.\`location_id\` = d.\`location_id\`
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND d.id = e.space_id
                     INNER JOIN compliance_measure f
                                ON 1 = 1
                                  AND e.compliance_measure_id = f.id
                     INNER JOIN compliance_category g
                                ON 1 = 1
                                  AND f.compliance_category_id = g.id
                     INNER JOIN compliance_measure_frequency_category h
                                ON 1 = 1
                                  AND f.\`frequency_type\` = h.\`id\`
              WHERE 1 = 1
                AND a.user_id_assignee = ?
                ${conditions}
              
                AND a.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
              
              GROUP BY e.id
              ORDER BY e.due_for_checking ASC
            `;
        }

        if (userType === 'Administrator' || userType === 'Account Holder') {
            sql = `
              SELECT e.id,
                     f.\`name\`                                  AS measure,
                     g.name                                      AS compliance_category,
                     CONCAT(
                         'every ',
                         f.\`frequency_unit\`,
                         ' ',
                         h.\`name\`,
                         IF(f.frequency_unit > 1, 's', '')
                       )                                         AS frequency,
                     CASE
                       WHEN (
                         DATEDIFF(e.\`due_for_checking\`, NOW()) BETWEEN 0 AND 30
                         )
                         THEN 'Due Soon'
                       WHEN (e.\`due_for_checking\` <= NOW())
                         THEN 'Overdue'
                       ELSE 'Ok'
                       END                                       AS \`status\`,
                     DATE_FORMAT(e.due_for_checking, '%d-%m-%Y') AS due,
                     d.name as space_name,
                     d.id as space_id
              FROM \`account_holder_assigned_company\` a
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN location c
                                ON 1 = 1
                                  AND c.\`company_id\` = b.\`id\`
                     INNER JOIN \`space\` d
                                ON 1 = 1
                                  AND d.\`location_id\` = c.\`id\`
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND d.id = e.space_id
                     INNER JOIN compliance_measure f
                                ON 1 = 1
                                  AND e.compliance_measure_id = f.id
                     INNER JOIN compliance_category g
                                ON 1 = 1
                                  AND f.compliance_category_id = g.id
                     INNER JOIN compliance_measure_frequency_category h
                                ON 1 = 1
                                  AND f.\`frequency_type\` = h.\`id\`
              WHERE 1 = 1
                AND a.user_id_assignee = ?
                ${conditions}
              
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP BY e.id
              ORDER BY e.due_for_checking ASC
            `;
        }

        if (userType === 'Reviewer') {
            sql = `
              SELECT e.id,
                     f.\`name\`                                  AS measure,
                     g.name                                      AS compliance_category,
                     CONCAT(
                         'every ',
                         f.\`frequency_unit\`,
                         ' ',
                         h.\`name\`,
                         IF(f.frequency_unit > 1, 's', '')
                       )                                         AS frequency,
                     CASE
                       WHEN (
                         DATEDIFF(e.\`due_for_checking\`, NOW()) BETWEEN 0 AND 30
                         )
                         THEN 'Due Soon'
                       WHEN (e.\`due_for_checking\` <= NOW())
                         THEN 'Overdue'
                       ELSE 'Ok'
                       END                                       AS \`status\`,
                     DATE_FORMAT(e.due_for_checking, '%d-%m-%Y') AS due,
                     d.name as space_name,
                     d.id as space_id
              FROM \`reviewer_assigned_company\` a
                     INNER JOIN company b
                                ON 1 = 1
                                  AND a.\`company_id\` = b.\`id\`
                     INNER JOIN location c
                                ON 1 = 1
                                  AND c.\`company_id\` = b.\`id\`
                     INNER JOIN \`space\` d
                                ON 1 = 1
                                  AND d.\`location_id\` = c.\`id\`
                     INNER JOIN compliance e
                                ON 1 = 1
                                  AND d.id = e.space_id
                     INNER JOIN compliance_measure f
                                ON 1 = 1
                                  AND e.compliance_measure_id = f.id
                     INNER JOIN compliance_category g
                                ON 1 = 1
                                  AND f.compliance_category_id = g.id
                     INNER JOIN compliance_measure_frequency_category h
                                ON 1 = 1
                                  AND f.\`frequency_type\` = h.\`id\`
              WHERE 1 = 1
                AND a.user_id_assignee = ?
                ${conditions}
              
                AND a.is_active = 1
                AND b.is_active = 1
                AND c.is_active = 1
                AND d.is_active = 1
                AND e.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP BY e.id
              ORDER BY e.due_for_checking ASC
            `;
        }

        if (userType === 'Compliance Certifier') {
            sql = `
              SELECT e.id,
                     f.\`name\`                                  AS measure,
                     g.name                                      AS compliance_category,
                     CONCAT(
                         'every ',
                         f.\`frequency_unit\`,
                         ' ',
                         h.\`name\`,
                         IF(f.frequency_unit > 1, 's', '')
                       )                                         AS frequency,
                     CASE
                       WHEN (
                         DATEDIFF(e.\`due_for_checking\`, NOW()) BETWEEN 0 AND 30
                         )
                         THEN 'Due Soon'
                       WHEN (e.\`due_for_checking\` <= NOW())
                         THEN 'Overdue'
                       ELSE 'Ok'
                       END                                       AS \`status\`,
                     DATE_FORMAT(e.due_for_checking, '%d-%m-%Y') AS due,
                     d.name as space_name,
                     d.id as space_id
              FROM \`compliance_contributor_assigned_measures\` a
                
                    INNER JOIN compliance e
                                ON 1 = 1
                                  AND a.compliance_id = e.id
                     INNER JOIN compliance_measure f
                                ON 1 = 1
                                  AND e.compliance_measure_id = f.id
                     INNER JOIN compliance_category g
                                ON 1 = 1
                                  AND f.compliance_category_id = g.id
                     INNER JOIN compliance_measure_frequency_category h
                                ON 1 = 1
                                  AND f.\`frequency_type\` = h.\`id\`
                
                     INNER JOIN \`space\` d
                                ON 1 = 1
                                  AND e.\`space_id\` = d.\`id\`
                
                     INNER JOIN location c
                                ON 1 = 1
                                  AND d.\`location_id\` = c.\`id\`
                
                     INNER JOIN company b
                                ON 1 = 1
                                  AND c.\`company_id\` = b.\`id\`
              WHERE 1 = 1
                AND a.user_id = ?
                ${conditions}
              
                AND a.is_active = 1
                AND e.is_active = 1
                AND d.is_active = 1
                AND c.is_active = 1
                AND b.is_active = 1
                AND c.payment_status != 'Suspended'
              GROUP BY e.id
              ORDER BY e.due_for_checking ASC
            `;
        }

        try {
            const query = await db.query(sql, [userId]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getComplianceMeasureById(complianceId, userId) {

        let sql = `
          SELECT e.id,
                 f.\`name\`                                                                            AS measure,
                 g.name                                                                                AS compliance_category,
                 e.latest_status AS latest_compliance_status,
                 CONCAT(
                     'every ',
                     f.\`frequency_unit\`,
                     ' ',
                     h.\`name\`,
                     IF(f.frequency_unit > 1, 's', '')
                   )                                                                                   AS frequency,
                 CASE
                   WHEN (
                     DATEDIFF(e.\`due_for_checking\`, NOW()) BETWEEN 0 AND 30
                     )
                     THEN 'Due Soon'
                   WHEN (e.\`due_for_checking\` <= NOW())
                     THEN 'Overdue'
                   ELSE 'Ok'
                   END                                                                                 AS \`status\`,
                 DATE_FORMAT(e.due_for_checking, '%Y-%m-%d')                                           AS due,
                 f.ncc_bca_provisions,
                 f.standard,
                 c.name AS location,
                 c.id AS location_id,
                 d.name AS space,
                 f.description,
                 CONCAT(IF(latest_status IS NULL, 'Unchecked New Entry', IF(latest_status = 0, 'Fail', 'Pass')), ' ',
                        IF(last_date_checked IS NULL, '', DATE_FORMAT(last_date_checked, '%Y-%m-%d'))) AS latest_status,
                 DATE_FORMAT(e.last_date_checked, '%Y-%m-%d')                                          AS last_date_checked,
                 f.document_link,
                 e.latest_action_rating,
                 e.latest_actions_initiated
          FROM compliance e
                 INNER JOIN \`space\` d
                            ON 1 = 1
                              AND e.\`space_id\` = d.\`id\`
                 INNER JOIN location c
                            ON 1 = 1
                              AND d.\`location_id\` = c.\`id\`
                 INNER JOIN company b
                            ON 1 = 1
                              AND c.\`company_id\` = b.\`id\`
                 INNER JOIN compliance_measure f
                            ON 1 = 1
                              AND e.compliance_measure_id = f.id
                 INNER JOIN compliance_category g
                            ON 1 = 1
                              AND f.compliance_category_id = g.id
                 INNER JOIN compliance_measure_frequency_category h
                            ON 1 = 1
                              AND f.\`frequency_type\` = h.\`id\`
          WHERE 1 = 1
            AND e.id = ?
            AND c.payment_status != 'Suspended'
          GROUP BY e.id
          ORDER BY e.due_for_checking ASC
        `;

        const historyTransaction = transaction.getHistoryTransactionFragment(
            userId,
            'Viewed',
            'Compliance Dashboard'
        );
        const viewTransaction = transaction.buildTransactionFragment(sql, [complianceId]);

        try {
            const query = await db.queryTransaction([historyTransaction, viewTransaction]);

            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function userHasCompliances(userId, userType) {

        try {
            let sql = '';

            if (userType === 'Manager') {
                sql = `
                  SELECT COUNT(*) AS compliance_count
                  FROM compliance a
                         INNER JOIN \`space\` b
                                    ON 1 = 1
                                      AND a.\`space_id\` = b.\`id\`
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND b.\`location_id\` = c.\`id\`
                         INNER JOIN manager_assigned_location d
                                    ON 1 = 1
                                      AND d.location_id = c.id
                  WHERE 1 = 1
                    
                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                    AND d.\`user_id_assignee\` = ?
                `;
            }

            if (userType === 'Administrator' || userType === 'Account Holder') {
                sql = `
                  SELECT COUNT(*) AS compliance_count
                  FROM compliance a
                         INNER JOIN \`space\` b
                                    ON 1 = 1
                                      AND a.\`space_id\` = b.\`id\`
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND b.\`location_id\` = c.\`id\`
                         INNER JOIN account_holder_assigned_company d
                                    ON 1 = 1
                                      AND c.\`company_id\` = d.\`company_id\`
                  WHERE 1 = 1

                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                    AND d.\`user_id_assignee\` = ?
                `;
            }

            if (userType === 'Reviewer') {
                sql = `
                  SELECT COUNT(*) AS compliance_count
                  FROM compliance a
                         INNER JOIN \`space\` b
                                    ON 1 = 1
                                      AND a.\`space_id\` = b.\`id\`
                         INNER JOIN location c
                                    ON 1 = 1
                                      AND b.\`location_id\` = c.\`id\`
                         INNER JOIN reviewer_assigned_company d
                                    ON 1 = 1
                                      AND c.\`company_id\` = d.\`company_id\`
                  WHERE 1 = 1

                    AND a.is_active = 1
                    AND b.is_active = 1
                    AND c.is_active = 1
                    AND d.is_active = 1
                    AND c.payment_status != 'Suspended'
                    AND d.\`user_id_assignee\` = ?
                `;
            }

            if (userType === 'Compliance Certifier') {
                sql = `
                  SELECT 
                    COUNT(*) AS compliance_count
                  FROM compliance_contributor_assigned_measures a
                  WHERE 1 = 1
                    AND a.is_active = 1
                    AND a.\`user_id\` = ?
                `;
            }

            const result = await db.query(sql, [userId]);
            const complianceCount = parseFloat(result[0]['compliance_count']);

            return complianceCount !== 0;
        } catch (errors) {
            return errors;
        }
    }

    async function updateComplianceDueDate(complianceId, newDueDate, historyMsg, userId, latestStatus) {

        try {
            const Transaction = new db.Transaction;

            Transaction.addTransaction({
                stmt: `
                  UPDATE compliance
                    SET due_for_checking = ?
                  WHERE id = ?;
                `,
                args: [newDueDate, complianceId]
            });

            if (latestStatus === null) {
                latestStatus = 0;
            }

            Transaction.addTransaction({
                stmt: `
                  INSERT INTO compliance_history (message, category, compliance_id, user_id, comments, \`status\`)
                  VALUES 
                         (?, 'Due Date', ?, ?, 'N/A', ?);
                `,
                args: [historyMsg, complianceId, userId, latestStatus]
            });

            const result = await Transaction.executeTransaction();

            return result;
        } catch (errors) {
            return errors;
        }
    }

    async function getHistoryByComplianceId(complianceId) {
        try {
            const sql = `
              SELECT a.id,
                     DATE_FORMAT(a.date_created, '%Y-%m-%d') AS \`date\`,
                     a.message,
                     a.category,
                     CONCAT(b.lastname, ', ', b.firstname)   AS \`user\`,
                     a.comments
              FROM compliance_history a
                     INNER JOIN \`user\` b
                                ON 1 = 1
                                  AND a.user_id = b.id
                     INNER JOIN compliance c 
                                ON 1 = 1
                                  AND a.compliance_id = c.id
                                  AND c.is_active = 1
              WHERE 1 = 1
                AND a.compliance_id = ?
              ORDER BY a.date_created DESC
            `;

            const result = await db.query(sql, [complianceId]);

            return result;
        } catch (errors) {
            return errors;
        }
    }

    async function updateComplianceAddResult(status, complianceId, resultDate, historyMsg, userId, comments) {
        try {
            /*const sql = `
              CALL PROC_UPDATE_COMPLIANCE_ADD_RESULT(?, ?, ?, ?, ?, ?)
            `;*/

            const connection = db.getMySQL_connection();
            const promisedQuery = db.getPromisifiedQuery(connection);

            let query = new Promise((resolve, reject) => {
                connection.beginTransaction(async () => {
                    try {
                        if (status === 0) {
                            await promisedQuery(`
                                UPDATE compliance
                                SET last_date_checked = ?,
                                    latest_status = 0
                                WHERE id = ?;
                                `, [resultDate, complianceId]
                            );

                            await promisedQuery(`
                                INSERT INTO compliance_history (message, category, compliance_id, user_id, comments)
                                VALUES (?, 'Result', ?, ?, ?);
                                `, [historyMsg, complianceId, userId, comments]
                            );
                        }

                        if (status === 1) {
                            let nextComplianceDate = await promisedQuery(`
                                (SELECT
                                    CASE
                                      WHEN d.name = 'year' THEN DATE_ADD(?, INTERVAL + b.frequency_unit YEAR)
                                      WHEN d.name = 'month' THEN DATE_ADD(?, INTERVAL + b.frequency_unit MONTH)
                                      END AS datee
                                  FROM compliance a
                                         INNER JOIN compliance_measure b
                                                    ON 1 = 1
                                                      AND a.compliance_measure_id = b.id
                                         INNER JOIN compliance_category c
                                                    ON 1 = 1
                                                      AND b.compliance_category_id = c.id
                                         INNER JOIN compliance_measure_frequency_category d
                                                    ON 1 = 1
                                                      AND b.frequency_type = d.id
                                  WHERE 1 = 1
                                    AND a.id = ?)
                            `, [resultDate, resultDate, complianceId]);

                            let date = nextComplianceDate[0]['datee'];

                            await promisedQuery(`
                                UPDATE compliance
                                SET last_date_checked = ?,
                                    due_for_checking = ?,
                                    latest_status = 1
                                WHERE id = ?;
                            `, [resultDate, date, complianceId]
                            );

                            await promisedQuery(`
                                INSERT INTO compliance_history (message, category, compliance_id, user_id, comments)
                                VALUES (?, 'Result', ?, ?, ?);
                                `, [historyMsg, complianceId, userId, comments]
                            );
                        }

                        resolve(connection.commit());
                    } catch (error) {
                        reject(connection.rollback());
                        console.log('omg has errors');
                        console.log(error);
                    }
                });
            });

            return query;

            /*const result = await db.query(sql, [
                status,
                complianceId,
                resultDate,
                historyMsg,
                userId,
                comments,
            ]);

            return result;*/
        } catch (errors) {
            return errors;
        }
    }

    async function updateComplianceAddResult3(resultType, // Pass or Fail.
                                              complianceId,
                                              resultDate,
                                              userId,
                                              comments,
                                              actionRating,
                                              adviseManager,
                                              adviseAdministrator,
                                              resultsDetail,) {
        const connection = db.getMySQL_connection();
        const promisedQuery = db.getPromisifiedQuery(connection);

        return new Promise((resolve, reject) => {
            connection.beginTransaction(async () => {
                try {

                    // If Pass
                    if (resultType === 'Pass') {

                        let nextComplianceDate = await promisedQuery(`
                                SELECT
                                    CASE
                                      WHEN d.name = 'year' THEN DATE_ADD(?, INTERVAL + b.frequency_unit YEAR)
                                      WHEN d.name = 'month' THEN DATE_ADD(?, INTERVAL + b.frequency_unit MONTH)
                                      END AS \`date\`
                                  FROM compliance a
                                         INNER JOIN compliance_measure b
                                                    ON 1 = 1
                                                      AND a.compliance_measure_id = b.id
                                         INNER JOIN compliance_category c
                                                    ON 1 = 1
                                                      AND b.compliance_category_id = c.id
                                         INNER JOIN compliance_measure_frequency_category d
                                                    ON 1 = 1
                                                      AND b.frequency_type = d.id
                                  WHERE 1 = 1
                                    AND a.id = ?
                            `, [resultDate, resultDate, complianceId]);

                        let date = nextComplianceDate[0]['date'];

                        await promisedQuery(`
                                UPDATE compliance
                                SET last_date_checked = ?,
                                    latest_action_rating = 'Pass',
                                    latest_actions_initiated = 'N/A',
                                    due_for_checking = ?,
                                    latest_status = 1
                                WHERE id = ?;
                            `, [resultDate, date, complianceId]
                        );


                        let sqlCreateComplianceHistory = `
                            INSERT INTO compliance_history (
                              compliance_id,
                              category,
                              user_id,
                              comments,
                              status,
                              message
                            ) 
                            VALUES
                              (
                                ?,
                                'Result',
                                ?,
                                ?,
                                ?,
                                'Set to "Pass"'
                              ) ;
                        `;

                        try {
                            // Insert compliance history
                            let complianceHistory = await promisedQuery(sqlCreateComplianceHistory, [
                                complianceId,
                                userId,
                                comments,
                                1, // Passes
                            ]);

                            // Get newly inserted id.
                            let complianceHistoryId = complianceHistory['insertId'];

                            // Validate and insert result details using the new compliance history id as the pivot value.
                            if (Array.isArray(resultsDetail)) {

                                let isWellFormed = true;

                                if (resultsDetail.length > 0) {
                                    console.log(resultsDetail)
                                    for (let i in resultsDetail) {
                                        if (
                                            typeof resultsDetail[i]['headingOfMeasure'] === "undefined" ||
                                            typeof resultsDetail[i]['itemDescription'] === "undefined" ||
                                            typeof resultsDetail[i]['itemSize'] === "undefined" ||
                                            typeof resultsDetail[i]['locationDescription'] === "undefined" ||
                                            typeof resultsDetail[i]['status'] === "undefined" ||
                                            typeof resultsDetail[i]['date'] === "undefined" ||
                                            typeof resultsDetail[i]['defectType'] === "undefined" ||
                                            typeof resultsDetail[i]['comments'] === "undefined"
                                        ) {
                                            isWellFormed = false;
                                            break;
                                        }
                                    }

                                    if (isWellFormed) {
                                        // Loop again and insert query.
                                        let resultsDetailSQL = `
                                        INSERT INTO compliance_result_detail (
                                              compliance_history_id,
                                              heading_of_measure,
                                              item_description,
                                              item_size,
                                              location_description,
                                              status,
                                              \`date\`,
                                              defect_type,
                                              comments
                                        ) VALUES 
                                    `;

                                        let resultsDetailValuesSQL = '';

                                        for (let i in resultsDetail) {

                                            let {
                                                headingOfMeasure,
                                                itemDescription,
                                                itemSize,
                                                locationDescription,
                                                status,
                                                date,
                                                defectType,
                                                comments,
                                            } = resultsDetail[i];

                                            date = moment(date);

                                            if (date.isValid() === false) {
                                                date = moment().format('YYYY-MM-DD').toString();
                                            } else {
                                                date = date.format('YYYY-MM-DD').toString();
                                            }

                                            if (parseFloat(i) === (_.size(resultsDetail) - 1)) {
                                                resultsDetailValuesSQL += `
                                                (
                                                    '${complianceHistoryId}', 
                                                    '${headingOfMeasure}', 
                                                    '${itemDescription}', 
                                                    '${itemSize}', 
                                                    '${locationDescription}', 
                                                    '${status}', 
                                                    '${date}', 
                                                    '${defectType}', 
                                                    '${comments}' 
                                                )
                                            `;
                                            } else {
                                                resultsDetailValuesSQL += `
                                                (
                                                    '${complianceHistoryId}', 
                                                    '${headingOfMeasure}', 
                                                    '${itemDescription}', 
                                                    '${itemSize}', 
                                                    '${locationDescription}', 
                                                    '${status}', 
                                                    '${date}', 
                                                    '${defectType}', 
                                                    '${comments}' 
                                                ),
                                            `;
                                            }
                                        }

                                        resultsDetailSQL += resultsDetailValuesSQL;

                                        console.log(resultsDetailSQL);

                                        await promisedQuery(resultsDetailSQL, []);
                                    }
                                }
                            }

                            resolve(connection.commit());
                        } catch (error) {
                            reject(error);
                        }
                    } else {

                        /**
                         * =================
                         * Rules for failure
                         * =================
                         */

                        // Force advise manager and admin if critical defect.
                        if (actionRating === 'Critical Defect') {
                            adviseManager = 1;
                            adviseAdministrator = 1;
                        }

                        let actionsInitiated = [];
                        let actionRatingText = actionRating;

                        // Some data manipulations below...
                        if (actionRating === 'Non-Critical Defect') {
                            actionRating = 1;
                        }

                        if (actionRating === 'Critical Defect') {
                            actionRating = 2;
                        }

                        if (adviseAdministrator) {
                            actionsInitiated.push('Advise Administrator');
                        }

                        if (adviseManager) {
                            actionsInitiated.push('Advise Manager');
                        }

                        actionsInitiated = JSON.stringify(actionsInitiated);

                        await promisedQuery(`
                                UPDATE compliance
                                SET last_date_checked = ?,
                                    latest_action_rating = ?,
                                    latest_actions_initiated = ?,
                                    latest_status = 0
                                WHERE id = ?;
                                `, [resultDate, actionRatingText, actionsInitiated, complianceId]
                        );

                        // Do insert.
                        let sqlCreateComplianceHistory = `
                            INSERT INTO compliance_history (
                              compliance_id,
                              category,
                              user_id,
                              comments,
                              status,
                              compliance_action_initiated_type_id,
                              advise_manager,
                              advise_administrator,
                              message
                            ) 
                            VALUES
                              (
                                ?,
                                'Result',
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                ?,
                                'Set to "Fail"'
                              );
                        `;

                        try {
                            let complianceHistory = await promisedQuery(sqlCreateComplianceHistory, [
                                complianceId,
                                userId,
                                comments,
                                0, // Fails
                                actionRating,
                                adviseManager,
                                adviseAdministrator,
                            ]);

                            let complianceHistoryId = complianceHistory['insertId'];

                            if (Array.isArray(resultsDetail)) {

                                let isWellFormed = true;

                                if (resultsDetail.length > 0) {
                                    for (let i in resultsDetail) {
                                        if (
                                            typeof resultsDetail[i]['headingOfMeasure'] === "undefined" ||
                                            typeof resultsDetail[i]['itemDescription'] === "undefined" ||
                                            typeof resultsDetail[i]['itemSize'] === "undefined" ||
                                            typeof resultsDetail[i]['locationDescription'] === "undefined" ||
                                            typeof resultsDetail[i]['status'] === "undefined" ||
                                            typeof resultsDetail[i]['date'] === "undefined" ||
                                            typeof resultsDetail[i]['defectType'] === "undefined" ||
                                            typeof resultsDetail[i]['comments'] === "undefined"
                                        ) {
                                            isWellFormed = false;
                                            break;
                                        }
                                    }

                                    if (isWellFormed) {
                                        // Loop again and insert query.
                                        let resultsDetailSQL = `
                                        INSERT INTO compliance_result_detail (
                                              compliance_history_id,
                                              heading_of_measure,
                                              item_description,
                                              item_size,
                                              location_description,
                                              status,
                                              \`date\`,
                                              defect_type,
                                              comments
                                        ) VALUES 
                                    `;

                                        let resultsDetailValuesSQL = '';

                                        for (let i in resultsDetail) {

                                            let {
                                                headingOfMeasure,
                                                itemDescription,
                                                itemSize,
                                                locationDescription,
                                                status,
                                                date,
                                                defectType,
                                                comments,
                                            } = resultsDetail[i];

                                            date = moment(date);

                                            if (date.isValid() === false) {
                                                date = moment().format('YYYY-MM-DD').toString();
                                            } else {
                                                date = date.format('YYYY-MM-DD').toString();
                                            }

                                            if (parseFloat(i) === (_.size(resultsDetail) - 1)) {
                                                resultsDetailValuesSQL += `
                                                (
                                                    '${complianceHistoryId}', 
                                                    '${headingOfMeasure}', 
                                                    '${itemDescription}', 
                                                    '${itemSize}', 
                                                    '${locationDescription}', 
                                                    '${status}', 
                                                    '${date}', 
                                                    '${defectType}', 
                                                    '${comments}' 
                                                )
                                            `;
                                            } else {
                                                resultsDetailValuesSQL += `
                                                (
                                                    '${complianceHistoryId}', 
                                                    '${headingOfMeasure}', 
                                                    '${itemDescription}', 
                                                    '${itemSize}', 
                                                    '${locationDescription}', 
                                                    '${status}', 
                                                    '${date}', 
                                                    '${defectType}', 
                                                    '${comments}' 
                                                ),
                                            `;
                                            }
                                        }

                                        resultsDetailSQL += resultsDetailValuesSQL;

                                        console.log(resultsDetailSQL);

                                        await promisedQuery(resultsDetailSQL, []);
                                    }
                                }
                            }

                            resolve(connection.commit());
                        } catch (error) {
                            console.log('GG');
                            console.log(error);
                            console.log(reject);
                            reject(error);
                        }
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async function updateComplianceAddResult2(status,
                                              complianceId,
                                              resultDate,
                                              historyMsg,
                                              userId,
                                              comments,
                                              actionRating,
                                              actionsInitiated,
                                              resultsDetail,) {
        try {
            const connection = db.getMySQL_connection();
            const promisedQuery = db.getPromisifiedQuery(connection);

            let query = new Promise((resolve, reject) => {
                connection.beginTransaction(async () => {
                    try {
                        if (actionsInitiated.length === 0) {
                            actionsInitiated = 'None';
                        }

                        let complianceHistory = null;

                        if (status === 'Fail') {
                            await promisedQuery(`
                                UPDATE compliance
                                SET last_date_checked = ?,
                                    latest_action_rating = ?,
                                    latest_actions_initiated = ?,
                                    latest_status = 0
                                WHERE id = ?;
                                `, [resultDate, actionRating, actionsInitiated, complianceId]
                            );

                            complianceHistory = await promisedQuery(`
                                INSERT INTO compliance_history (message, category, compliance_id, user_id, comments)
                                VALUES (?, 'Result', ?, ?, ?);
                                `, [historyMsg, complianceId, userId, comments]
                            );
                        }

                        if (status === 'Pass') {

                            let nextComplianceDate = await promisedQuery(`
                                (SELECT
                                    CASE
                                      WHEN d.name = 'year' THEN DATE_ADD(?, INTERVAL + b.frequency_unit YEAR)
                                      WHEN d.name = 'month' THEN DATE_ADD(?, INTERVAL + b.frequency_unit MONTH)
                                      END AS datee
                                  FROM compliance a
                                         INNER JOIN compliance_measure b
                                                    ON 1 = 1
                                                      AND a.compliance_measure_id = b.id
                                         INNER JOIN compliance_category c
                                                    ON 1 = 1
                                                      AND b.compliance_category_id = c.id
                                         INNER JOIN compliance_measure_frequency_category d
                                                    ON 1 = 1
                                                      AND b.frequency_type = d.id
                                  WHERE 1 = 1
                                    AND a.id = ?)
                            `, [resultDate, resultDate, complianceId]);

                            let date = nextComplianceDate[0]['datee'];

                            let test = await promisedQuery(`
                                UPDATE compliance
                                SET last_date_checked = ?,
                                    latest_action_rating = 'Pass',
                                    latest_actions_initiated = 'N/A',
                                    due_for_checking = ?,
                                    latest_status = 1
                                WHERE id = ?;
                            `, [resultDate, date, complianceId]
                            );

                            complianceHistory = await promisedQuery(`
                                INSERT INTO compliance_history (message, category, compliance_id, user_id, comments)
                                VALUES (?, 'Result', ?, ?, ?);
                                `, [historyMsg, complianceId, userId, comments]
                            );
                        }

                        if (Array.isArray(resultsDetail)) {

                            let isWellFormed = true;

                            if (resultsDetail.length > 0) {
                                for (let i in resultsDetail) {
                                    if (
                                        typeof resultsDetail[i]['headingOfMeasure'] === "undefined" ||
                                        typeof resultsDetail[i]['itemDescription'] === "undefined" ||
                                        typeof resultsDetail[i]['itemSize'] === "undefined" ||
                                        typeof resultsDetail[i]['locationDescription'] === "undefined" ||
                                        typeof resultsDetail[i]['status'] === "undefined" ||
                                        typeof resultsDetail[i]['date'] === "undefined" ||
                                        typeof resultsDetail[i]['defectType'] === "undefined" ||
                                        typeof resultsDetail[i]['comments'] === "undefined"
                                    ) {
                                        isWellFormed = false;
                                        break;
                                    }
                                }

                                if (isWellFormed) {
                                    // Loop again and insert query.
                                    let resultsDetailSQL = `
                                        INSERT INTO compliance_result_detail (
                                              compliance_history_id,
                                              heading_of_measure,
                                              item_description,
                                              item_size,
                                              location_description,
                                              status,
                                              \`date\`,
                                              defect_type,
                                              comments
                                        ) VALUES 
                                    `;

                                    let resultsDetailValuesSQL = '';

                                    for (let i in resultsDetail) {

                                        let {
                                            headingOfMeasure,
                                            itemDescription,
                                            itemSize,
                                            locationDescription,
                                            status,
                                            date,
                                            defectType,
                                            comments,
                                        } = resultsDetail[i];

                                        date = moment(date);

                                        if (date.isValid() === false) {
                                            date = moment().format('YYYY-MM-DD').toString();
                                        } else {
                                            date = date.format('YYYY-MM-DD').toString();
                                        }

                                        if (parseFloat(i) === (_.size(resultsDetail) - 1)) {
                                            resultsDetailValuesSQL += `
                                                (
                                                    '${complianceHistory['newInsertId']}', 
                                                    '${headingOfMeasure}', 
                                                    '${itemDescription}', 
                                                    '${itemSize}', 
                                                    '${locationDescription}', 
                                                    '${status}', 
                                                    '${date}', 
                                                    '${defectType}', 
                                                    '${comments}' 
                                                )
                                            `;
                                        } else {
                                            resultsDetailValuesSQL += `
                                                (
                                                    '${complianceHistory['newInsertId']}', 
                                                    '${headingOfMeasure}', 
                                                    '${itemDescription}', 
                                                    '${itemSize}', 
                                                    '${locationDescription}', 
                                                    '${status}', 
                                                    '${date}', 
                                                    '${defectType}', 
                                                    '${comments}' 
                                                ),
                                            `;
                                        }
                                    }

                                    resultsDetailSQL += resultsDetailValuesSQL;

                                    console.log(resultsDetailSQL);

                                    await promisedQuery(resultsDetailSQL, []);
                                }
                            }
                        }

                        resolve(connection.commit());
                    } catch (error) {
                        connection.rollback();

                        reject({
                            hasError: 1,
                            sql: error
                        });
                        console.log('omg has errors');
                        console.log(error);
                    }
                });
            });

            return query;
        } catch (errors) {
            console.log('returning');
            reject({
                hasError: 1,
                sql: errors
            });
        }
    }

    async function getComplianceMeasureRawById(complianceId) {
        try {
            const sql = `
              SELECT *
              FROM compliance a
              WHERE 1 = 1
                AND id = ?
            `;

            const result = await db.query(sql, [complianceId]);

            return result;
        } catch (errors) {
            return errors;
        }
    }

    async function updateComplianceDocument(complianceId,
                                            fileName,
                                            dir,
                                            userId,
                                            complianceDocumentId,
                                            locationId) {
        try {

            // Remove public... Something to do with the server.
            dir = dir.replace('public/', '');

            const Transaction = new db.Transaction;

            Transaction.addTransaction({
                stmt: `
                    INSERT INTO compliance_document (
                      compliance_id,
                      \`name\`,
                      dir,
                      user_id,
                      location_id
                    )
                    VALUES
                      (?, ?, ?, ?, ?);
                `,
                args: [complianceId, fileName, dir, userId, locationId],
            });

            Transaction.addTransaction({
                stmt: `
                  UPDATE compliance_document
                    SET iteration = iteration + 1
                  WHERE id = ?;
                `,
                args: [complianceDocumentId],
            });

            return await Transaction.executeTransaction();
        } catch (errors) {
            return errors;
        }
    }

    async function getDocumentIteration(fileName, complianceId) {
        try {
            const sql = `
              SELECT id,
                     iteration
              FROM compliance_document
              WHERE 1 = 1
                AND \`name\` = ?
                AND \`compliance_id\` = ?
            `;

            return await db.query(sql, [fileName, complianceId]);
        } catch (errors) {
            return errors;
        }
    }

    async function getUploadedDocuments(complianceId, locationId) {
        try {
            let sql = `
              SELECT a.id,
                     DATE_FORMAT(date_added, '%Y-%m-%d')           AS date_added,
                     a.\`name\`,
                     a.\`dir\`,
                     CONCAT(b.\`lastname\`, ', ', b.\`firstname\`) AS added_by,
                     a.location_id
              FROM compliance_document a
                     INNER JOIN \`user\` b
                                ON 1 = 1
                                  AND a.\`user_id\` = b.\`id\`
                     INNER JOIN compliance c 
                                ON 1 = 1
                                  AND a.compliance_id = c.id
                                  AND c.is_active = 1
              WHERE 1 = 1
                AND a.\`compliance_id\` = ? `
            if(locationId) sql += `OR location_id = ?`
            sql += ` ORDER BY a.\`date_added\` DESC
            `;

            return await db.query(sql, [complianceId, locationId]);
        } catch (errors) {
            return errors;
        }
    }

    /**
     *
     * @param concernType ('Due Soon', 'Overdue')
     * @param userType ('Administrator', 'Compliance Certifier')
     * @param managementCompanyId
     * @returns {Promise<void>}
     */
    async function getItemsOfConcern(userType, managementCompanyId) {
        // inject dynamic concernType
        // Perform
        //

        let sql = '';

        if (userType === 'Administrator' || userType === 'Account Holder') {
            // Get Compliances from administrators.
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
                                                    AND (e.name = 'Administrator' OR e.name = 'Account Holder')
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
            // Get Compliances from administrators.
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
                                       INNER JOIN manager_assigned_location c
                                                  ON 1 = 1
                                                    AND b.\`location_id\` = c.\`location_id\`
                                       INNER JOIN \`user\` d
                                                  ON 1 = 1
                                                    AND c.\`user_id_assignee\` = d.\`id\`
                                                    AND d.\`management_company_id\` = ?
                                       INNER JOIN user_type e
                                                  ON 1 = 1
                                                    AND d.\`user_type_id\` = e.\`id\`
                                                    AND e.name = 'Manager'

                                GROUP BY a.id, d.email
                                ORDER BY days_due ASC) AS a
                          WHERE 1 = 1
                            AND a.status != 'Ok') AS a
                    GROUP BY email) AS a
            `;
        }

        try {
            const query = await db.query(sql, [managementCompanyId]);

            return query;
        } catch (err) {
            console.log(err);
        }
    }

    function determineStatusType(status) {
        if (status === null) {
            status = 'Uncheked New Entry';
        } else if (status === 0) {
            status = 'Fail';
        } else {
            status = 'Pass';
        }

        return status;
    }

    async function sendNotificationEmails(complianceId, actionsInitiated, actionRating) {

        if (actionsInitiated.length > 0) {

            try {
                if (actionsInitiated.includes('Advise Manager')) {
                    // Send emails to managers.
                    let sql = `
                        SELECT 
                            a.id AS compliance_id,
                            GROUP_CONCAT(DISTINCT(e.email)) AS emails,
                            cm.name
                        FROM compliance a 
                            INNER JOIN compliance_measure cm
                            ON 1 = 1
                        AND a.compliance_measure_id = cm.id
                            INNER JOIN space b
                            ON 1 = 1
                            AND a.space_id = b.id
                            AND b.is_active = 1
                        INNER JOIN location c 
                            ON 1 = 1
                            AND b.location_id = c.id
                            AND c.is_active = 1
                            AND c.payment_status != 'Suspended'
                        INNER JOIN manager_assigned_location d 
                            ON 1 = 1
                            AND c.id = d.location_id
                            AND d.is_active = 1 
                        INNER JOIN \`user\` e
                            ON 1 = 1
                            AND d.user_id = e.id
                            AND e.is_active = 1 
                        INNER JOIN user_type f 
                            ON 1 = 1
                            AND e.user_type_id = f.id
                            AND f.name = 'Manager'
                        WHERE 1 = 1
                            AND a.id = ?
                            AND a.is_active = 1
                    `;

                    db.query(sql, [complianceId])
                        .then(result => {
                            if ((result.length > 1) || (result.length === 1 && result[0]['emails'] !== null)) {
                                const emails = result[0]['emails'];
                                const complianceName = result[0]['name'];
                                const complianceId = result[0]['compliance_id'];


                                EmailService2.sendActionInitiatedEmails(emails, complianceName, complianceId, actionRating);
                            }
                        });
                }

                if (actionsInitiated.includes('Advise Administrator')) {
                    // Send emails to Administrators.
                    let sql = `
                        SELECT 
                            a.id AS compliance_id,
                            GROUP_CONCAT(DISTINCT(e.email)) AS emails,
                            cm.name
                        FROM compliance a 
                            INNER JOIN compliance_measure cm
                            ON 1 = 1
                        AND a.compliance_measure_id = cm.id
                            INNER JOIN space b
                            ON 1 = 1
                            AND a.space_id = b.id
                            AND b.is_active = 1
                        INNER JOIN location c 
                            ON 1 = 1
                            AND b.location_id = c.id
                            AND c.is_active = 1
                            AND c.payment_status != 'Suspended'
                        INNER JOIN manager_assigned_location d 
                            ON 1 = 1
                            AND c.id = d.location_id
                            AND d.is_active = 1 
                        INNER JOIN \`user\` e
                            ON 1 = 1
                            AND d.user_id = e.id
                            AND e.is_active = 1 
                        INNER JOIN user_type f 
                            ON 1 = 1
                            AND e.user_type_id = f.id
                            AND (f.name = 'Administrator' OR f.name = 'Account Holder')
                        WHERE 1 = 1
                            AND a.id = ?
                            AND a.is_active = 1
                    `;

                    db.query(sql, [complianceId])
                        .then(result => {
                            if ((result.length > 1) || (result.length === 1 && result[0]['emails'] !== null)) {
                                const emails = result[0]['emails'];
                                const complianceName = result[0]['name'];
                                const complianceId = result[0]['compliance_id'];


                                EmailService2.sendActionInitiatedEmails(emails, complianceName, complianceId, actionRating);
                            }
                        });
                }
            } catch (errors) {
                console.log(errors);
                console.log('Something went wrong in sending the emails.');
            }
        } else {
            console.log('No actions initiated. I will send no emails.');
        }
    }

    async function addActionInitiatedHistory(complianceId, compliance_action_initiated_type_id, adviseManager, adviseAdministrator, createdBy) {

        let sql = `
            INSERT INTO compliance_action_initiated(compliance_id, compliance_action_initiated_type_id, advise_manager, advise_administrator, created_by)
            VALUES(?, ?, ?, ?, ?);
        `;

        // Add the result details here instead.

        try {
            let result = await db.query(sql, [complianceId, compliance_action_initiated_type_id, adviseManager, adviseAdministrator, createdBy]);

            return result;
        } catch (err) {
            console.log('omg error in our history table');
            console.log(err);
        }
    }

    async function getMyPortfolioReportByLocationAndManager(userId, locationId, byspace) {
        let sql = `
            SELECT 
              cc.id,
              cc.name,
              COUNT(DISTINCT(IF (c.latest_status = 0 OR c.latest_status IS NULL, c.id, NULL))) AS fail,
              COUNT(DISTINCT(IF (c.latest_status = 1, c.id, NULL))) AS pass,
              COUNT(DISTINCT(c.id)) AS total_items, 
              get_spaces(cc.id, ${locationId}, ${userId}) AS spaces,
              DATE_FORMAT(MAX(DATE(c.due_for_checking)), '%Y-%m-%d') AS due_date,
              GROUP_CONCAT(DISTINCT(c.id)) as compliance_id,
              GROUP_CONCAT(DISTINCT
                CASE 
                  WHEN (crd.id IS NULL) THEN NULL
                  ELSE CONCAT(
                    crd.id, 
                    '<-->',
                    CONCAT('Heading of Measure: ', crd.heading_of_measure), 
                    '<-->',
                    CONCAT('Item Description: ', crd.item_description), 
                    '<-->',
                    CONCAT('Item Size: ', crd.item_size), 
                    '<-->',
                    CONCAT('Location Description: ', crd.location_description),  
                    '<-->',
                    CONCAT('Status: ', crd.status), 
                    '<-->',
                    CONCAT('Date: ', DATE_FORMAT(crd.date, '%d-%m-%Y')), 
                    '<-->',
                    CONCAT('Defect Type: ', crd.defect_type), 
                    '<-->',
                    CONCAT('Comments: ', crd.comments)
                  )
                END
              SEPARATOR '---') AS result_details`;
        sql += byspace ? `,c.space_id,
              s.name as space_name` : '';
        sql += ` FROM
              compliance c 
              INNER JOIN \`space\` s 
                ON 1 = 1
                AND c.space_id = s.id
                AND s.is_active = 1 
                AND c.is_active = 1
              INNER JOIN location l 
                ON 1 = 1
                AND s.location_id = l.id
                AND l.is_active = 1 
                AND l.payment_status != 'Suspended'
              INNER JOIN manager_assigned_location mal 
                ON 1 = 1
                AND l.id = mal.location_id 
                AND mal.is_active = 1 
              INNER JOIN compliance_measure cm 
                ON 1 = 1 
                AND c.compliance_measure_id = cm.id 
              INNER JOIN compliance_category cc
                ON 1 = 1 
                AND cm.compliance_category_id = cc.id
              
              -- Here
              LEFT JOIN compliance_history ch 
                ON 1 = 1
                AND c.id = ch.compliance_id 
              LEFT JOIN compliance_result_detail crd 
                ON 1 = 1
                AND ch.id = crd.compliance_history_id 
              LEFT JOIN compliance_action_initiated_type cait
                ON 1 = 1
                AND ch.compliance_action_initiated_type_id = cait.id
              LEFT JOIN compliance c2 
                ON 1 = 1
                AND ch.compliance_id = c2.id
                AND c2.is_active =  1
              LEFT JOIN compliance_measure cm2 
                ON 1 = 1
                AND c2.compliance_measure_id = cm2.id
              WHERE 1 = 1 
                AND mal.user_id_assignee = ?
                AND mal.location_id = ?
            GROUP BY  cc.id
        `;
        sql += byspace ? `, c.space_id` : '';

        sql = `
            SELECT * FROM (${sql}) AS a
        `;

        let details = [];
        const result = await db.query(sql, [userId, locationId]);

        for (let i in result) {
            const detail = result[i];

            let complianceMeasureIds = detail['compliance_id'].split(",");
            let compliance_measures = [];
            for (let i in complianceMeasureIds) {
                const complianceMeasureId = complianceMeasureIds[i];
                let comlianceMeasure = await getComplianceMeasureById(complianceMeasureId, userId);
                compliance_measures = compliance_measures.concat(comlianceMeasure);
            }
            detail.compliance_measures = compliance_measures;
            details.push(detail);
        }

        return details;
    }


    async function getComplianceCategoryLocationAndManagerStatus(complianceCategory, userId, locationId) {
        let sql = `SELECT a.space,
                IF(SUM(fail) > 0,'fail','pass') AS status
                FROM
                    (SELECT 
                        s.id AS space_id,
                            IF(c.latest_status = 0
                                OR c.latest_status IS NULL, 1, 0) AS \`fail\`,
                            s.name AS \`space\`
                    FROM
                        manager_assigned_location mas
                    INNER JOIN \`space\` s ON 1 = 1
                        AND mas.\`location_id\` = s.\`location_id\`
                    INNER JOIN compliance c ON 1 = 1 AND s.\`id\` = c.\`space_id\`
                    INNER JOIN compliance_measure cm ON 1 = 1
                        AND c.\`compliance_measure_id\` = cm.\`id\`
                    INNER JOIN \`user\` u ON 1 = 1 AND mas.user_id_assignee = u.\`id\`
                    WHERE
                        1 = 1
                            AND cm.\`compliance_category_id\` = ?
                            AND mas.\`location_id\` = ?
                            AND mas.\`user_id_assignee\` = ?
                            AND mas.\`is_active\` = 1
                            AND u.\`is_active\` = 1
                            AND s.\`is_active\` = 1
                            AND c.\`is_active\` = 1) AS a
                GROUP BY space_id`
        sql = `
            SELECT * FROM (${sql}) AS a
        `;

        const result = await db.query(sql, [complianceCategory, locationId, userId], 1);

        return result;
    }

    /*async function  getMyPortfolioReportByLocationAndManager(userId, locationId) {
        let sql = `
            SELECT
              cc.id,
              cc.name,
              COUNT(DISTINCT(IF (c.latest_status = 0 OR c.latest_status IS NULL, c.id, NULL))) AS fail,
              COUNT(DISTINCT(IF (c.latest_status = 1, c.id, NULL))) AS pass,
              COUNT(DISTINCT(c.id)) AS total_items,
              get_spaces(cc.id, ${locationId}, ${userId}) AS spaces,
              DATE_FORMAT(MAX(DATE(c.due_for_checking)), '%Y-%m-%d') AS due_date,
              GROUP_CONCAT(DISTINCT
                CASE
                  WHEN (crd.id IS NULL) THEN NULL
                  ELSE CONCAT(
                    crd.id,
                    '<-->',
                    CONCAT('Heading of Measure: ', crd.heading_of_measure),
                    '<-->',
                    CONCAT('Item Description: ', crd.item_description),
                    '<-->',
                    CONCAT('Item Size: ', crd.item_size),
                    '<-->',
                    CONCAT('Location Description: ', crd.location_description),
                    '<-->',
                    CONCAT('Status: ', crd.status),
                    '<-->',
                    CONCAT('Date: ', DATE_FORMAT(crd.date, '%d-%m-%Y')),
                    '<-->',
                    CONCAT('Defect Type: ', crd.defect_type),
                    '<-->',
                    CONCAT('Comments: ', crd.comments)
                  )
                END
              SEPARATOR '---') AS result_details,
              GROUP_CONCAT(
                CASE
                  WHEN (cai.id IS NULL) THEN NULL
                  WHEN (cai.advise_administrator = 1 AND cai.advise_manager = 1) THEN CONCAT(
                    DATE(cai.date_created),
                    ': ',
                    IF(cait.name IS NULL, '', CONCAT('(', cait.name, ') ')),
                    cm2.name,
                    ' - ',
                    'Advised Administrator and Advised Manager'
                    -- I need a stored function here which will return an empty string OR all the compliance items
                  )
                  WHEN (cai.advise_administrator = 1 AND cai.advise_manager = 1) THEN CONCAT(
                    DATE(cai.date_created),
                    ': ',
                    IF(cait.name IS NULL, '', CONCAT('(', cait.name, ') ')),
                    cm2.name,
                    ' - ',
                    'Advised Administrator'
                  )
                  WHEN (cai.advise_administrator = 1 AND cai.advise_manager = 1) THEN CONCAT(
                    DATE(cai.date_created),
                    ': ',
                    IF(cait.name IS NULL, '', CONCAT('(', cait.name, ') ')),
                    cm2.name,
                    ' - ',
                    'Advised Manager'
                  )
                  ELSE NULL
                END
               SEPARATOR '---') AS actions_initiated
            FROM
              compliance c
              INNER JOIN \`space\` s
                ON 1 = 1
                AND c.space_id = s.id
                AND s.is_active = 1
                AND c.is_active = 1
              INNER JOIN location l
                ON 1 = 1
                AND s.location_id = l.id
                AND l.is_active = 1
              INNER JOIN manager_assigned_location mal
                ON 1 = 1
                AND l.id = mal.location_id
                AND mal.is_active = 1
              INNER JOIN compliance_measure cm
                ON 1 = 1
                AND c.compliance_measure_id = cm.id
              INNER JOIN compliance_category cc
                ON 1 = 1
                AND cm.compliance_category_id = cc.id
              LEFT JOIN compliance_action_initiated cai
                ON 1 = 1
                AND c.id = cai.compliance_id
              -- Here
              LEFT JOIN compliance_history ch
                ON 1 = 1
                AND c.id = ch.compliance_id
              LEFT JOIN compliance_result_detail crd
                ON 1 = 1
                AND ch.id = crd.compliance_history_id
              LEFT JOIN compliance_action_initiated_type cait
                ON 1 = 1
                AND cai.compliance_action_initiated_type_id = cait.id
              LEFT JOIN compliance c2
                ON 1 = 1
                AND cai.compliance_id = c2.id
                AND c2.is_active =  1
              LEFT JOIN compliance_measure cm2
                ON 1 = 1
                AND c2.compliance_measure_id = cm2.id
              WHERE 1 = 1
                AND mal.user_id_assignee = ?
                AND mal.location_id = ?
            GROUP BY cc.id
        `;

        sql = `
            SELECT * FROM (${sql}) AS a
        `;

        const result = await db.query(sql, [userId, locationId], 1);

        return result;
    }*/


    async function getMyPortfolioReport(managementCompanyId, byspace) {

        let report = [];

        let userSql = `
            SELECT 
                u.id AS user_id,
                l.id AS location_id,
                u.firstname,
                u.lastname,
                CONCAT(u.firstname, ' ', u.lastname) AS manager,
                mal.location_id,
                c.name AS company,
                l.name AS location
            FROM \`user\` u 
            INNER JOIN user_type ut 
                ON 1 = 1 
                AND u.user_type_id = ut.id
                AND ut.name = 'Manager'
            INNER JOIN manager_assigned_location mal 
                ON 1 = 1
                AND u.id = mal.user_id_assignee
            INNER JOIN location l 
                ON 1 = 1
                AND mal.location_id = l.id
            INNER JOIN company c 
                ON 1 = 1
                AND l.company_id = c.id
            WHERE  1 = 1
                AND u.management_company_id = ?
                AND u.is_active = 1
                AND mal.is_active = 1
                AND u.is_active = 1
                AND l.is_active = 1
                AND c.is_active = 1
                AND l.payment_status != 'Suspended'
        `;

        // Load managers.
        let data = await db.query(userSql, [managementCompanyId], 1);

        for (let i in data) {
            const details = data[i];

            report.push({
                manager: details['manager'],
                location: details['location'],
                company: details['company'],
                details: await getMyPortfolioReportByLocationAndManager(details['user_id'], details['location_id'], byspace)
            })
        }

        return report;
    }

    async function getMyPortfolioReportOld(managerId) {
        let sql = `
            SELECT 
              cc.name,
              COUNT(DISTINCT(IF (c.latest_status = 0 OR c.latest_status IS NULL, c.id, NULL))) AS fail,
              COUNT(DISTINCT(IF (c.latest_status = 1, c.id, NULL))) AS pass,
              COUNT(DISTINCT(c.id)) AS total_items,
              DATE_FORMAT(MAX(DATE(c.due_for_checking)), '%Y-%m-%d') AS due_date,
              GROUP_CONCAT(
                CASE 
                  WHEN (cai.id IS NULL) THEN NULL
                  WHEN (cai.advise_administrator = 1 AND cai.advise_manager = 1) THEN CONCAT(
                    DATE(cai.date_created),
                    ': ',
                    IF(cait.name IS NULL, '', CONCAT('(', cait.name, ') ')),
                    cm2.name,
                    ' - ',
                    'Advised Administrator and Advised Manager'
                  ) 
                  WHEN (cai.advise_administrator = 1 AND cai.advise_manager = 1) THEN CONCAT(
                    DATE(cai.date_created),
                    ': ',
                    IF(cait.name IS NULL, '', CONCAT('(', cait.name, ') ')),
                    cm2.name,
                    ' - ',
                    'Advised Administrator'
                  ) 
                  WHEN (cai.advise_administrator = 1 AND cai.advise_manager = 1) THEN CONCAT(
                    DATE(cai.date_created),
                    ': ',
                    IF(cait.name IS NULL, '', CONCAT('(', cait.name, ') ')),
                    cm2.name,
                    ' - ',
                    'Advised Manager'
                  ) 
                  ELSE NULL
                END  
               SEPARATOR '---') AS actions_initiated
            FROM
              compliance c 
              INNER JOIN \`space\` s 
                ON 1 = 1
                AND c.space_id = s.id
                AND s.is_active = 1 
                AND c.is_active = 1
              INNER JOIN location l 
                ON 1 = 1
                AND s.location_id = l.id
                AND l.is_active = 1 
                AND l.payment_status != 'Suspended'
              INNER JOIN manager_assigned_location mal 
                ON 1 = 1
                AND l.id = mal.location_id 
                AND mal.is_active = 1 
              INNER JOIN compliance_measure cm 
                ON 1 = 1 
                AND c.compliance_measure_id = cm.id 
              INNER JOIN compliance_category cc
                ON 1 = 1 
                AND cm.compliance_category_id = cc.id
              LEFT JOIN compliance_action_initiated cai 
                ON 1 = 1
                AND c.id = cai.compliance_id
              LEFT JOIN compliance_action_initiated_type cait
                ON 1 = 1
                AND cai.compliance_action_initiated_type_id = cait.id
              LEFT JOIN compliance c2 
                ON 1 = 1
                AND cai.compliance_id = c2.id
                AND c2.is_active =  1
              LEFT JOIN compliance_measure cm2 
                ON 1 = 1
                AND c2.compliance_measure_id = cm2.id
              WHERE 1 = 1 
                AND mal.user_id_assignee = ?
            GROUP BY cc.id
        `;

        // Further order by date.
        sql = `
            SELECT 
                * 
            FROM 
                (${sql}) 
            AS a 
            ORDER BY due_date ASC
        `;

        try {
            let data = await db.query(sql, [managerId]);

            return data;
        } catch (err) {
            return err;
        }
    }

    async function getManagers(managementCompanyId) {
        let sql = ` 
            SELECT 
                u.id,
                CONCAT(u.lastname, ', ', u.firstname) AS \`name\`
            FROM \`user\` u 
            INNER JOIN user_type ut 
                ON 1 = 1
                AND u.user_type_id = ut.id
            WHERE 1 = 1 
                AND u.management_company_id = ?
                AND u.is_active = 1
                AND ut.name = 'Manager'
        `;

        let result = await db.query(sql, [managementCompanyId]);

        return result;
    }

    async function getArchives(managementCompanyId) {

        let sql = ` 
            SELECT 
                r.id,
                DATE_FORMAT(r.date, '%Y-%m-%d') AS \`date\` 
            FROM report r 
            
            INNER JOIN report_type rt 
                ON 1 = 1
                    AND r.report_type_id = rt.id
                    
            WHERE 1 = 1
                AND r.management_company_id = ?
                AND rt.name = 'My Portfolio Report'
            
            ORDER BY r.date DESC
        `;

        let result = await db.query(sql, [managementCompanyId]);

        return result;
    }

    async function getArchive(archiveId, managementCompanyId) {

        let sql = ` 
            SELECT 
                r.content 
            FROM report r 
            
            INNER JOIN report_type rt 
                ON 1 = 1
                    AND r.report_type_id = rt.id
                    
            WHERE 1 = 1
                AND r.id = ?
                AND r.management_company_id = ?
                AND rt.name = 'My Portfolio Report'
            
            ORDER BY r.date DESC
        `;

        let result = await db.query(sql, [archiveId, managementCompanyId]);

        return result;
    }

    async function addReportToArchives(report, managementCompanyId) {

        // Archives results if has anything.
        if (report.length > 0) {
            let sql = `
                INSERT INTO report (
                  management_company_id,
                  report_type_id,
                  content
                )
                VALUES
                  (
                    ?,
                    (SELECT id FROM report_type WHERE \`name\` = 'My Portfolio Report'),
                    ?
                  ) ;
            `;

            let data = await db.query(sql, [managementCompanyId, JSON.stringify(report)]);
        }
    }

    async function getResultDetailsByComplianceId(complianceId) {
        try {

            const sql = `
                SELECT 
                    crd.id,
                    crd.compliance_history_id,
                    crd.heading_of_measure,
                    crd.item_description,
                    crd.item_size,
                    crd.location_description,
                    crd.status,
                    DATE_FORMAT(crd.date, '%Y-%m-%d') AS \`date\`,
                    crd.defect_type,
                    crd.comments 
                FROM compliance_result_detail crd 
                INNER JOIN compliance_history ch 
                    ON 1 = 1
                        AND crd.compliance_history_id = ch.id
                INNER JOIN compliance c 
                    ON 1 = 1
                        AND ch.compliance_id = c.id
                WHERE 1 = 1 
                    AND c.id = ?
                    AND c.is_active = 1
                    AND crd.compliance_history_id = ch.id
            `;

            const result = await db.query(sql, [complianceId]);

            return result;
        } catch (errors) {
            return errors;
        }
    }

    async function updateComplianceResultDetail(complianceResultDetailId, status, date, defectType, comments, userId) {
        try {

            const connection = db.getMySQL_connection();
            const promisedQuery = db.getPromisifiedQuery(connection);

            let query = new Promise((resolve, reject) => {
                connection.beginTransaction(async () => {
                    try {
                        // Run update
                        let updateSQL = `
                            UPDATE 
                              compliance_result_detail 
                            SET
                              \`status\` = ?,
                              \`date\` = ?,
                              defect_type = ?,
                              comments = ?,  
                              last_updated_by = ? 
                            WHERE id = ? ;
                        `;

                        date = moment(date).format('YYYY-MM-DD').toString();

                        await promisedQuery(updateSQL, [
                            status,
                            date,
                            defectType,
                            comments,
                            userId,
                            complianceResultDetailId,
                        ]);

                        // Check all items under this compliance if it it has no more failed entries.
                        let complianceHistoryIdSQL = `
                            SELECT 
                                compliance_history_id 
                            FROM compliance_result_detail crd
                            WHERE 1 = 1
                                AND crd.id = ?
                        `;

                        let allResultsPassSQL = `
                            SELECT 
                              IF(SUM(IF(crd.\`status\` = 'pass', 1, 0)) / COUNT(crd.status) = 1, 1, 0) AS all_results_pass
                            FROM
                              compliance c 
                              INNER JOIN compliance_history ch 
                              ON 1 = 1
                                AND ch.\`compliance_id\` = c.\`id\`
                              INNER JOIN compliance_result_detail crd 
                                ON 1 = 1
                                AND crd.\`compliance_history_id\` = ch.\`id\`
                               
                            WHERE 1 = 1 
                              AND c.id = 
                              (SELECT 
                                ch.\`compliance_id\` 
                              FROM
                                compliance_result_detail crd 
                                INNER JOIN compliance_history ch 
                                  ON 1 = 1 
                                  AND crd.\`compliance_history_id\` = ch.\`id\` 
                              WHERE 1 = 1 
                                AND crd.\`id\` = ?
                              LIMIT 1)
                        `;

                        let allResultsPass = await promisedQuery(allResultsPassSQL, [complianceResultDetailId]);

                        allResultsPass = parseFloat(allResultsPass[0]['all_results_pass']);

                        if (allResultsPass) {
                            // Get compliance info.
                            const complianceSQL = `
                                SELECT * FROM compliance c 
                                WHERE 1 = 1 
                                  AND c.id = 
                                  (SELECT 
                                    ch.\`compliance_id\` 
                                  FROM
                                    compliance_result_detail crd 
                                    INNER JOIN compliance_history ch 
                                      ON 1 = 1 
                                      AND crd.\`compliance_history_id\` = ch.\`id\` 
                                  WHERE 1 = 1 
                                    AND crd.\`id\` = ?
                                  LIMIT 1)
                            `;

                            // Extract compliance details.
                            let compliance = await promisedQuery(complianceSQL, [complianceResultDetailId]);
                            compliance = compliance[0];

                            let complianceId = compliance['id'];

                            let nextComplianceDate = await promisedQuery(`
                                SELECT
                                    CASE
                                      WHEN d.name = 'year' THEN DATE_ADD(NOW(), INTERVAL + b.frequency_unit YEAR)
                                      WHEN d.name = 'month' THEN DATE_ADD(NOW(), INTERVAL + b.frequency_unit MONTH)
                                      END AS \`date\`
                                  FROM compliance a
                                         INNER JOIN compliance_measure b
                                                    ON 1 = 1
                                                      AND a.compliance_measure_id = b.id
                                         INNER JOIN compliance_category c
                                                    ON 1 = 1
                                                      AND b.compliance_category_id = c.id
                                         INNER JOIN compliance_measure_frequency_category d
                                                    ON 1 = 1
                                                      AND b.frequency_type = d.id
                                  WHERE 1 = 1
                                    AND a.id = ?
                            `, [complianceId]);

                            let date = nextComplianceDate[0]['date'];

                            let updateCompliance = await promisedQuery(`
                                UPDATE compliance
                                    SET last_date_checked = NOW(),
                                        latest_action_rating = 'Pass',
                                        latest_actions_initiated = 'N/A',
                                        due_for_checking = ?,
                                        latest_status = 1
                                    WHERE id = ?;
                                `, [date, complianceId]
                            );
                        }

                        resolve(connection.commit());
                    } catch (error) {
                        reject(connection.rollback());
                        console.log('omg has errors');
                        console.log(error);
                    }
                });
            });

            return query;

            /*const result = await db.query(sql, [
                status,
                complianceId,
                resultDate,
                historyMsg,
                userId,
                comments,
            ]);

            return result;*/
        } catch (errors) {
            return errors;
        }
    }

    /*async function updateComplianceResultDetail(complianceResultDetailId, status, date, defectType, comments, userId) {

        try {
            let sql = `
                UPDATE 
                  compliance_result_detail 
                SET
                  status = ?,
                  \`date\` = ?,
                  defect_type = ?,
                  comments = ?,  
                  last_updated_by = ? 
                WHERE id = ? ;
            `;

            const result = await db.query(sql, [
                status,
                date,
                defectType,
                comments,
                userId,
                complianceResultDetailId,
            ], 1);

            // Start a transaction here

            return result;
        } catch (errors) {
            return errors;
        }
    }*/


    return {
        updateComplianceResultDetail: updateComplianceResultDetail,
        getResultDetailsByComplianceId: getResultDetailsByComplianceId,
        getManagers: getManagers,
        getArchives: getArchives,
        getArchive: getArchive,
        addReportToArchives: addReportToArchives,
        getMyPortfolioReport: getMyPortfolioReport,
        getMyPortfolioReportOld: getMyPortfolioReportOld,
        addActionInitiatedHistory: addActionInitiatedHistory,
        sendNotificationEmails: sendNotificationEmails,
        determineStatusType: determineStatusType,
        getItemsOfConcern: getItemsOfConcern,
        getFilters: getFilters,
        getDocumentIteration: getDocumentIteration,
        updateComplianceDocument: updateComplianceDocument,
        getHistoryByComplianceId: getHistoryByComplianceId,
        updateComplianceDueDate: updateComplianceDueDate,
        updateComplianceAddResult: updateComplianceAddResult,
        updateComplianceAddResult2: updateComplianceAddResult2,
        updateComplianceAddResult3: updateComplianceAddResult3,
        userHasCompliances: userHasCompliances,
        getComplianceMeasures: getComplianceMeasures,
        getComplianceMeasureById: getComplianceMeasureById,
        getUploadedDocuments: getUploadedDocuments,
        getComplianceMeasureRawById: getComplianceMeasureRawById,
        getCompaniesWithAccess: getCompaniesWithAccess,
        getLocationsWithAccess: getLocationsWithAccess,
        getSpacesWithAccess: getSpacesWithAccess,
        getComplianceCategoriesWithAccess: getComplianceCategoriesWithAccess,
    }

})();

var express = require('express'),
    _ = require('lodash'),
    transaction = require('../database/transaction'),
    db = require('../database/database'),
    moment = require('moment'),
    EmailService = require('../email/email'),
    EmailService2 = require('../email/email2'),
    Utils = require('../../services/utils');

module.exports = Service;