const express = require('express'),
    _ = require('lodash'),
    db = require('../../services/database/database'),
    ComplianceMeasureService = require('../../services/complianceMeasure/complianceMeasure'),
    UserService = require('../../services/users/users'),
    LocationService = require('../../services/location/location'),
    Utils = require('../../services/utils');

const complianceMeasureId = async (req, res, next) => {
    req.assert('compliance_measure_id', 'Compliance Measure Id must be valid and should not be empty.')
        .notEmpty()
        .hasEntries('compliance_measure', 'id');

    try {
        await req.asyncValidationErrors();

        next();
    } catch (err) {
        res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
            error: Utils.extractErrorMessages(errors),
            payload: Utils.extractRequestParams(req)
        }));
    }
};

const complianceMeasureCategoryId = async (req, res, next) => {
    req.assert('compliance_measure_category_id', 'Compliance Measure Category Id must be valid and should not be empty.')
        .notEmpty()
        .hasEntries('compliance_category', 'id');

    try {
        await req.asyncValidationErrors();

        next();
    } catch (err) {
        res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
            error: Utils.extractErrorMessages(errors),
            payload: Utils.extractRequestParams(req)
        }));
    }
};

const complianceMeasureFrequencyCategoryId = async (req, res, next) => {
    req.assert('compliance_measure_frequency_category_id', 'Compliance Measure Frequency Category Id must be valid and should not be empty.')
        .notEmpty()
        .hasEntries('compliance_measure_frequency_category', 'id');

    try {
        await req.asyncValidationErrors();

        next();
    } catch (err) {
        res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
            error: Utils.extractErrorMessages(errors),
            payload: Utils.extractRequestParams(req)
        }));
    }
};

const updateComplianceRequiredFields = async (req, res, next) => {

    req.assert('name', 'Name must not be empty.').notEmpty();
    req.assert('ncc_bca_provisions', 'NCC BCA Provisions must not be empty').notEmpty();

    req.assert(
        'compliance_measure_category_id',
        'Compliance Measure Category Id must be valid and should not be empty.'
    )
        .notEmpty()
        .hasEntries('compliance_category', 'id');

    req.assert(
        'compliance_measure_id',
        'Compliance Measure ID must be valid and should not be empty.'
    )
        .notEmpty()
        .hasEntries('compliance_measure', 'id');

    req.assert(
        'compliance_measure_frequency_category_id',
        'Compliance Measure Frequency Category Id must be valid and should not be empty.'
    )
        .notEmpty()
        .hasEntries('compliance_measure_frequency_category', 'id');

    req.assert('standard', 'Standard must not be empty.').notEmpty();
    req.assert('frequency_unit', 'Frequency Unit must not be empty and must be numeric.').notEmpty().isNumeric();
    req.assert('description', 'Description must not be empty.').notEmpty();
    req.assert('document_link', 'Document Link must not be empty.').notEmpty();

    // Experimental.
    req.assert('is_national', 'Is national must either be "0" or "1".').inArrayValues([0, 1]);
    req.assert('selected_states', 'Must be an array.').isArrayButCanBeEmpty();

    try {
        await req.asyncValidationErrors();

        let selectedStates = req.param('selected_states');
        const isNational = req.param('is_national');

        if (!isNational) {
            console.log('Verify the states');
            if (selectedStates.length === 0) {
                // Terminate.
                return res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            data: {
                                msg: "You passed empty states.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                // Terminate if some states are invalid.
                const statesValid = await LocationService.isValidStates(selectedStates);

                if (!statesValid) {
                    return res.send(
                        Utils.responseBuilder(
                            500,
                            "FAIL",
                            "Query Failed.",
                            {
                                data: {
                                    msg: "You passed some invalid states.",
                                },
                                payload: Utils.extractRequestParams(req)
                            }
                        )
                    );
                }
            }
        } else {
            console.log('No need to verify the states');
        }

        // Else proceed.
        next();
    } catch (errors) {
        res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
            error: Utils.extractErrorMessages(errors),
            payload: Utils.extractRequestParams(req)
        }));
    }
};

module.exports = {
    complianceMeasureId: complianceMeasureId,
    complianceMeasureCategoryId: complianceMeasureCategoryId,
    complianceMeasureFrequencyCategoryId: complianceMeasureFrequencyCategoryId,

    updateComplianceRequiredFields: updateComplianceRequiredFields,
};

