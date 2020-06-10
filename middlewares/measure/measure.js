const express = require('express'),
    _ = require('lodash'),
    MeasureService = require('../../services/measure/measure'),
    UserService = require('../../services/users/users'),
    db = require('../../services/database/database'),
    Utils = require('../../services/utils');

const Middlewares = (function () {

    async function getComplianceMeasures(req, res, next) {
        req.assert('company_id', 'The name field must be valid and not be empty.').hasEntries('company', 'id', 1);
        req.assert('location_id', 'The name field must be valid and not be empty.').hasEntries('location', 'id', 1);
        req.assert('space_id', 'The name field must be valid or be empty.').hasEntriesOrEmpty('`space`', 'id', 1);
        req.assert('compliance_category_id', 'The name field must be valid or be empty.')
            .hasEntriesOrEmpty('compliance_category', 'id');

        try {
            await req.asyncValidationErrors();

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function checkValidDueDate(req, res, next) {
        req.assert('due_date', 'The due date field must be a valid date format.').notEmpty();

        try {
            await req.asyncValidationErrors();

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function checkAddResultFields(req, res, next) {
        req.assert('result_date', 'The result date field must be a valid date format.').notEmpty().isValidDateFormat();
        // req.assert('comments', 'The comment field must not be empty.').notEmpty();
        req.assert('status', 'The state field must be either 0 or 1.').notEmpty().hasArrValues([0, 1]);

        try {
            await req.asyncValidationErrors();

            if (typeof req.param('comments') === "undefined") {
                req.body.comments = '';
            }

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function checkUploadDocumentFields(req, res, next) {

        if (req.files === null) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to fetch the management companies.",
                    {
                        error: {
                            msg: 'No file attached.',
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

        next();
    }

    async function checkAddResultsFields(req, res, next) {

        req.assert('result_type', 'The result type has to be valid.').notEmpty().inArrayValues(['Pass', 'Fail']);
        req.assert('result_date', 'The date field must be of format "YYYY-MM-DD".').notEmpty().isValidDateFormat();

        try {
            await req.asyncValidationErrors();

            // Determine the rest of the actions here.
            const resultType = req.param('result_type');

            if (resultType === 'Pass') {

            }

            if (resultType === 'Fail') {
                const actionRating = req.param('action_rating');

                if (typeof actionRating === "undefined") {
                    return res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                        error: {
                            action_rating: `Defect Type parameter must be valid.`
                        },
                        payload: Utils.extractRequestParams(req)
                    }));
                }

                if (['Non-Critical Defect', 'Critical Defect'].indexOf(actionRating) === -1) {
                    return res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                        error: {
                            action_rating: `Defect Type must be "Non-Critical Defect" or "Critical Defect".`
                        },
                        payload: Utils.extractRequestParams(req)
                    }));
                }

                if (actionRating === 'Non-Critical Defect') {
                    // Ensure parameter "action_initiated" is valid.
                    let adviseManager = req.param('advise_manager');
                    let adviseAdministrator = req.param('advise_administrator');

                    if (["0", "1"].indexOf(adviseManager) === -1) {
                        return res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                            error: {
                                advise_manager: `Advise Manager must be 1 or 0.`,
                            },
                            payload: Utils.extractRequestParams(req)
                        }));
                    }

                    if (["0", "1"].indexOf(adviseAdministrator) === -1) {
                        return res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                            error: {
                                advise_administrator: `Advise Administrator must be 1 or 0.`,
                            },
                            payload: Utils.extractRequestParams(req)
                        }));
                    }
                }
            }

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function myPortfolioReport(req, res, next) {

        req.assert('manager_id', 'must be a valid user id').notEmpty().hasEntries('`user`', 'id', 1);

        try {
            await req.asyncValidationErrors();

            const user = await UserService.getUserById(req.param('manager_id'));

            if (user[0]['management_company_id'] !== req.param('management_company_id')) {
                return res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: {
                        manager_id: 'The manager_id passed must be of the same management company as the user.'
                    },
                    payload: Utils.extractRequestParams(req)
                }));
            }

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    return {
        myPortfolioReport: myPortfolioReport,
        checkAddResultsFields: checkAddResultsFields,
        checkAddResultFields: checkAddResultFields,
        checkUploadDocumentFields: checkUploadDocumentFields,
        getComplianceMeasures: getComplianceMeasures,
        checkValidDueDate: checkValidDueDate,
    }
})();

module.exports = Middlewares;