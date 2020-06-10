var _ = require('lodash'),
    db = require('../database/database'),
    fs = require('fs'),
    Utils = require('../../services/utils');

const Service = (function () {

    async function getBillingMessage(message) {
        let sql = `
            SELECT 'billing', ? AS message
        `;

        let result = await db.query(sql, [message]);

        return result;
    }

    async function getRate(managementCompanyId, pricing) {
        let sql = `SELECT 
                        COUNT(*) AS count
                    FROM
                        space
                    WHERE
                        location_id IN (SELECT 
                                id
                            FROM
                                location
                            WHERE
                                company_id IN (SELECT 
                                        c.id
                                    FROM
                                        user b
                                            INNER JOIN
                                        company c ON 1 = 1 AND b.id = c.created_by
                                            INNER JOIN
                                        management_company d ON 1 = 1 AND b.management_company_id = d.id
                                    WHERE
                                        1 = 1 AND b.management_company_id = ?
                                            AND c.is_active = 1))`
        let spaces = await db.query(sql, [managementCompanyId], 0);
        for (var s = 0; s < spaces.length; s++) {
            for (var p = 0; p < pricing.length; p++) {
                let spaceCount = spaces[s].count;
                if (pricing[p].min < spaceCount && pricing[p].max > spaceCount) {
                    return pricing[p].rate;
                }
            }
        }
    }

    async function getNumberOfSpacePerLocation(managementCompanyId) {
        let sql = `SELECT 
                    l.name AS location_name,
                    l.id AS location_id,
                    (SELECT 
                            COUNT(*)
                        FROM
                            space
                        WHERE
                            location_id = l.id
                                AND next_invoice_date = CURDATE()) space_count,
                    c.*
                FROM
                    location l,
                    company c
                WHERE
                    c.id = l.company_id
                        AND company_id IN (SELECT 
                            c.id
                        FROM
                            user b
                                INNER JOIN
                            company c ON 1 = 1 AND b.id = c.created_by
                                INNER JOIN
                            management_company d ON 1 = 1 AND b.management_company_id = d.id
                        WHERE
                            1 = 1 AND b.management_company_id = ?
                                AND c.is_active = 1)`;
        try {
            let locations = await db.query(sql, [managementCompanyId], 1);
            return locations;
        } catch (errors) {
            return errors;
        }
    }

    async function getTotalNumberOfSpacePerLocation(managementCompanyId) {
        let sql = `SELECT 
                    l.name AS location_name,
                    l.id AS location_id,
                    (SELECT 
                            COUNT(*)
                        FROM
                            space
                        WHERE
                            location_id = l.id) space_count,
                    c.*
                FROM
                    location l,
                    company c
                WHERE
                    c.id = l.company_id
                        AND company_id IN (SELECT 
                            c.id
                        FROM
                            user b
                                INNER JOIN
                            company c ON 1 = 1 AND b.id = c.created_by
                                INNER JOIN
                            management_company d ON 1 = 1 AND b.management_company_id = d.id
                        WHERE
                            1 = 1 AND b.management_company_id = ?
                                AND c.is_active = 1)`
        try {
            let locations = await db.query(sql, [managementCompanyId], 1);
            return locations;
        } catch (errors) {
            return errors;
        }
    }

    async function getManagementCompany() {
        let sql = 'SELECT * FROM compliance_link.management_company;';
        try {
            const query = await db.query(sql, []);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getPricing() {
        let sql = 'SELECT * FROM compliance_link.pricing;';
        try {
            const query = await db.query(sql, []);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function createCustomer(customerId, companyId) {
        const sql = `INSERT INTO customer (customer_ref_id, company_id) VALUES (?, ?); `;
        try {
            const query = await db.query(sql, [customerId, companyId]);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function updateCustomer(customerId, companyId) {
        const sql = `UPDATE customer SET customer_ref_id  = ? WHERE company_id = ?`;
        try {
            const query = await db.query(sql, [customerId, companyId]);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getCustomer(companyId) {
        let sql = 'SELECT * FROM customer WHERE company_id = ?'
        try {
            const query = await db.query(sql, [companyId]);
            return query;
        } catch (errors) {
            return errors;
        }
        return customer;
    }

    async function updateNextInvoiceDate(locationId) {
        const sql = `UPDATE space 
                SET 
                    next_invoice_date = CASE
                        WHEN billing_schedule = 'TRIAL' THEN DATE_ADD(NOW(), INTERVAL 15 MONTH)
                        ELSE DATE_ADD(NOW(), INTERVAL 12 MONTH)
                    END,
                    billing_schedule = 'ANNUAL'
                WHERE
                    location_id = ?
                        AND next_invoice_date = CURDATE()`;
        try {
            const query = await db.query(sql, [locationId]);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function createInvoiceDueDate(invoiceId, invoiceDueDate, locationId) {
        const sql = `INSERT INTO invoice_due_date (invoice_id, invoice_due_date, location_id) VALUES (?, ?,  ?)`;
        try {
            const query = await db.query(sql, [invoiceId, invoiceDueDate, locationId]);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function updateLocationPaymentStatus(paymentStatus, invoiceDueDate, locationId) {
        const sql = `UPDATE location SET payment_status  = ? ,invoice_due_date = ?WHERE id = ?`;
        try {
            const query = await db.query(sql, [paymentStatus, invoiceDueDate, locationId]);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function updateInvoicePaymentStatus(paymentStatus, invoiceDueDate, invoiceId, locationId) {
        const sql = `UPDATE invoice_due_date SET payment_status  = ?, invoice_due_date = ? WHERE invoice_id = ? AND location_id = ? `;
        try {
            const query = await db.query(sql, [paymentStatus, invoiceDueDate, invoiceId, locationId]);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getInvoiceDueDate(managementCompanyId) {
        const sql = `SELECT 
                        i.*,
                        DATE_ADD(i.invoice_due_date,
                            INTERVAL 2 WEEK) <= CURDATE() AS suspended
                    FROM
                        invoice_due_date i,
                        location l,
                        company c
                    WHERE
                        i.invoice_due_date <= CURDATE()
                            AND l.id = i.location_id
                            AND c.id = l.company_id
                            AND company_id IN (SELECT 
                                c.id
                            FROM
                                user b
                                    INNER JOIN
                                company c ON 1 = 1 AND b.id = c.created_by
                                    INNER JOIN
                                management_company d ON 1 = 1 AND b.management_company_id = d.id
                            WHERE
                                1 = 1 AND b.management_company_id = ?
                                    AND c.is_active = 1)`;
        try {
            const query = await db.query(sql, [managementCompanyId]);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    async function getInvoicePaymentStatus(managementCompanyId) {
        const sql = `SELECT 
                    i.location_id,
                    IF(GROUP_CONCAT(i.payment_status) LIKE '%Suspended%',
                        'Suspended',
                        IF(GROUP_CONCAT(i.payment_status) LIKE '%Over Due%',
                            'Over Due',
                            'Paid')) AS status,
                    MIN(i.invoice_due_date) AS invoice_due_date
                FROM
                    invoice_due_date i,
                    location l,
                    company c
                WHERE
                     i.payment_status IN ('Suspended','Over Due','Paid')
                    AND  l.id = i.location_id
                        AND c.id = l.company_id
                        AND company_id IN (SELECT 
                            c.id
                        FROM
                            user b
                                INNER JOIN
                            company c ON 1 = 1 AND b.id = c.created_by
                                INNER JOIN
                            management_company d ON 1 = 1 AND b.management_company_id = d.id
                        WHERE
                            1 = 1 AND b.management_company_id = ?
                                AND c.is_active = 1)
                GROUP BY i.location_id`;
        try {
            const query = await db.query(sql, [managementCompanyId]);
            return query;
        } catch (errors) {
            return errors;
        }
    }

    return {
        getBillingMessage: getBillingMessage,
        getNumberOfSpacePerLocation: getNumberOfSpacePerLocation,
        getRate: getRate,
        getManagementCompany: getManagementCompany,
        getPricing: getPricing,
        createCustomer: createCustomer,
        getCustomer: getCustomer,
        updateCustomer: updateCustomer,
        updateInvoicePaymentStatus: updateInvoicePaymentStatus,
        createInvoiceDueDate: createInvoiceDueDate,
        getInvoiceDueDate: getInvoiceDueDate,
        updateNextInvoiceDate: updateNextInvoiceDate,
        getInvoicePaymentStatus: getInvoicePaymentStatus,
        updateLocationPaymentStatus: updateLocationPaymentStatus,
        getTotalNumberOfSpacePerLocation: getTotalNumberOfSpacePerLocation
    }

})();

module.exports = Service;