var express = require('express'),
    _ = require('lodash'),
    db = require('../database/database'),
    transaction = require('../database/transaction'),
    Utils = require('../../services/utils');

const getComplianceMeasures = async () => {
    const sql = `
      SELECT 
            a.id,
            a.name, 
            a.ncc_bca_provisions, 
            b.name AS frequency_type, 
            a.frequency_unit, 
            a.standard, 
            c.name AS  compliance_category, 
            a.description, 
            a.document_link
      FROM compliance_measure a
      INNER JOIN compliance_measure_frequency_category b 
        ON 1 = 1
          AND a.frequency_Type = b.id
      INNER JOIN compliance_category c
                 ON 1 = 1
                   AND a.compliance_category_id = c.id
    `;

    try {
        const result = await db.query(sql);

        return result;
    } catch (err) {
        return err;
    }
};

const getComplianceMeasureById = async (id) => {

    const sql = `
      SELECT
        a.id,
        a.name,
        a.ncc_bca_provisions,
        a.frequency_type,
        a.frequency_unit,
        a.standard,
        a.compliance_category_id,
        a.description,
        a.document_link,
        GROUP_CONCAT(DISTINCT (b.state)) AS states,
        IF(SUM(b.is_national) > 0, TRUE, FALSE) AS is_national
      FROM compliance_measure a
      LEFT JOIN compliance_measure_applicable b
                ON 1 = 1
                  AND a.\`id\` = b.\`compliance_measure_id\`
      WHERE 1 = 1
        AND a.id = ?
      GROUP BY a.id
    `;

    try {
        const result = await db.query(sql, [id]);

        return result;
    } catch (err) {
        return err;
    }
};

const getComplianceMeasureFrequencyCategory = async () => {
    const sql = 'SELECT * FROM compliance_measure_frequency_category';

    try {
        const result = await db.query(sql);

        return result;
    } catch (err) {
        return err;
    }
};

const getComplianceMeasureCategory = async () => {
    const sql = 'SELECT * FROM compliance_category';

    try {
        return await db.query(sql);
    } catch (err) {
        return err;
    }
};


const updateComplianceMeasureOld = async (
    name,
    compliance_measure_id,
    ncc_bca_provisions,
    compliance_measure_category_id,
    compliance_measure_frequency_category_id,
    frequency_unit,
    description,
    document_link,
    standard
) => {
    const sql = `
        UPDATE 
          compliance_measure 
        SET
          \`name\` = ?,
          ncc_bca_provisions = ?,
          frequency_type = ?,
          frequency_unit = ?,
          standard = ?,
          compliance_category_id = ?,
          description = ?,
          document_link = ? 
        WHERE id = ? ;
    `;


    try {
        return await db.query(sql, [
            name,
            ncc_bca_provisions,
            compliance_measure_frequency_category_id,
            frequency_unit,
            standard,
            compliance_measure_category_id,
            description,
            document_link,
            compliance_measure_id,
        ]);
    } catch (err) {
        return err;
    }
};

const updateComplianceMeasure = async (
    name,
    compliance_measure_id,
    ncc_bca_provisions,
    compliance_measure_category_id,
    compliance_measure_frequency_category_id,
    frequency_unit,
    description,
    document_link,
    standard,
    is_national,
    selected_states
) => {
    const Transaction = new db.Transaction;

    // Logic.

    // Update first.
    Transaction.addTransaction({
        stmt: `
            UPDATE 
              compliance_measure 
            SET
              \`name\` = ?,
              ncc_bca_provisions = ?,
              frequency_type = ?,
              frequency_unit = ?,
              standard = ?,
              compliance_category_id = ?,
              description = ?,
              document_link = ? 
            WHERE id = ? ;
        `,
        args: [
            name,
            ncc_bca_provisions,
            compliance_measure_frequency_category_id,
            frequency_unit,
            standard,
            compliance_measure_category_id,
            description,
            document_link,
            compliance_measure_id,
        ]
    });


    // Delete all present settings
    Transaction.addTransaction({
        stmt: `
            DELETE FROM compliance_measure_applicable
            WHERE compliance_measure_id = ?
        `,
        args: [compliance_measure_id]
    });

    // Then, depending on is national or not, do some other logic.
    // If national.
    if (is_national === 1) {
        Transaction.addTransaction({
            stmt: `
              INSERT INTO compliance_measure_applicable (
                compliance_measure_id,
                is_national
              )
              VALUES
              (
                ?,
                '1'
              ) ;
            `,
                args: [compliance_measure_id]
            });
    } else {
        // If States.
        let insertParams = '';

        for (let i in selected_states) {
            insertParams += `(${compliance_measure_id}, 0, '${selected_states[i]}'),`
        }

        // Remove last comma.
        insertParams =  insertParams.substring(0, insertParams.length - 1);

        Transaction.addTransaction({
            stmt: `
              INSERT INTO compliance_measure_applicable (
                compliance_measure_id,
                is_national,
                state
              )
              VALUES ${insertParams}
            `,
            args: []
        });
    }

    try {
        return await Transaction.executeTransaction();
    } catch (err) {
        return err;
    }
};

module.exports = {
    updateComplianceMeasure: updateComplianceMeasure,

    getComplianceMeasures: getComplianceMeasures,
    getComplianceMeasureById: getComplianceMeasureById,
    getComplianceMeasureCategory: getComplianceMeasureCategory,
    getComplianceMeasureFrequencyCategory: getComplianceMeasureFrequencyCategory,
};