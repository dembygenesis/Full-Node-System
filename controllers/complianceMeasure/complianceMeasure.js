var express = require('express'),
    ComplianceMeasureService = require('../../services/complianceMeasure/complianceMeasure'),
    EmailService = require('../../services/email/email'),
    Utils = require('../../services/utils');

const getComplianceMeasures = async(req, res, next) => {

    const result = await ComplianceMeasureService.getComplianceMeasures();

    if (result.hasError) {
        return res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Failed to query the Compliance Measures.",
                {
                    error: {
                        msg: 'Failed to query the Compliance Measures.',
                    },
                    sqlError: result.sql,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    res.send(
        Utils.responseBuilder(
            200,
            "SUCCESS",
            "Successfully queried the Compliance Measures.",
            {
                data: result,
                payload: Utils.extractRequestParams(req)
            }
        )
    );
};

const getComplianceMeasureFrequencyCategory = async(req, res, next) => {

    const result = await ComplianceMeasureService.getComplianceMeasureFrequencyCategory();

    if (result.hasError) {
        return res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Failed to query the Compliance Measure Categories.",
                {
                    error: {
                        msg: 'Failed to query the Compliance Measure Categories.',
                    },
                    sqlError: result.sql,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    res.send(
        Utils.responseBuilder(
            200,
            "SUCCESS",
            "Successfully queried the Compliance Measure Categories.",
            {
                data: result,
                payload: Utils.extractRequestParams(req)
            }
        )
    );
};

const getComplianceMeasureById = async(req, res, next) => {

    const complianceMeasureId = req.param('compliance_measure_id');

    const result = await ComplianceMeasureService.getComplianceMeasureById(complianceMeasureId);

    if (result.hasError) {
        return res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Failed to query the Compliance Measure Categories.",
                {
                    error: {
                        msg: 'Failed to query the Compliance Measure Categories.',
                    },
                    sqlError: result.sql,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    res.send(
        Utils.responseBuilder(
            200,
            "SUCCESS",
            "Successfully queried the Compliance Measure Categories.",
            {
                data: result,
                payload: Utils.extractRequestParams(req)
            }
        )
    );
};

const getComplianceMeasureCategory = async (req, res) => {

    const result = await ComplianceMeasureService.getComplianceMeasureCategory();

    if (result.hasError) {
        return res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Failed to query the Compliance Measure Categories.",
                {
                    error: {
                        msg: 'Failed to query the Compliance Measure Categories.',
                    },
                    sqlError: result.sql,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    res.send(
        Utils.responseBuilder(
            200,
            "SUCCESS",
            "Successfully queried the Compliance Measure Categories.",
            {
                data: result,
                payload: Utils.extractRequestParams(req)
            }
        )
    );
};

const updateCompliance = async (req, res) => {

    const result = await ComplianceMeasureService.updateComplianceMeasure(
        req.param('name'),
        req.param('compliance_measure_id'),
        req.param('ncc_bca_provisions'),
        req.param('compliance_measure_category_id'),
        req.param('compliance_measure_frequency_category_id'),
        req.param('frequency_unit'),
        req.param('description'),
        req.param('document_link'),
        req.param('standard'),

        req.param('is_national'),
        req.param('selected_states'),
    );

    if (result.hasError) {
        res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Failed to update the compliance measure.",
                {
                    error: {
                        sql: "Failed to update the compliance measure.",
                    },
                    sqlError: result.sql,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    } else {
        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Successfully Updated The Compliance Measure.",
                {
                    data: {
                        msg: "Successfully Updated The Compliance Measure.",
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }
};

module.exports = {
    updateCompliance: updateCompliance,

    getComplianceMeasures: getComplianceMeasures,
    getComplianceMeasureById: getComplianceMeasureById,
    getComplianceMeasureCategory: getComplianceMeasureCategory,
    getComplianceMeasureFrequencyCategory: getComplianceMeasureFrequencyCategory,
};