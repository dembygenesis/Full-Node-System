const express = require('express'),
    _ = require('lodash'),
    db = require('../../services/database/database'),
    ComplianceService = require('../../services/compliance/compliance'),
    UserService = require('../../services/users/users'),
    Utils = require('../../services/utils');

const Middlewares = (function () {

    async function checkComplianceAccess(req, res, next) {

        req.assert('compliance_id', 'The compliance_id field must not be empty and must be valid.')
            .notEmpty()
            .commaDelimitedValuesMustBeUnique();


        try {
            await req.asyncValidationErrors();

            const complianceId = req.param('compliance_id').split(',');
            const userId = req.param('id');
            const userType = req.param('user_type');

            // Do something here.
            let complianceHasAccess = await ComplianceService.getComplianceAccessPrivilege(complianceId, userId, userType);

            if (complianceHasAccess.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            data: {
                                msg: "Something went wrong when trying to check the compliance access.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            complianceHasAccess = parseFloat(complianceHasAccess[0]['compliance_access']);

            if (complianceHasAccess === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            data: {
                                msg: "You do not have access to this compliance item.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function checkComplianceRequiredFields(req, res, next) {

        req.assert('compliance_measure_ids', 'The compliance measure id field must not be empty and must be unique.')
            .notEmpty();

        req.assert('space_id', 'The space id field must not be empty and must be valid.')
            .notEmpty()
            .hasEntries('`space`', 'id', 1);


        try {
            await req.asyncValidationErrors();

            next();
        } catch (errors) {
            // Send here.
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function checkComplianceMeasureIds(req, res, next) {
        req.assert('compliance_measure_ids', 'The compliance measure id field must not be empty and must be unique.')
            .commaDelimitedValuesMustBeUnique();

        try {
            await req.asyncValidationErrors();

            // If there is no error convert comma delimited entries to quote enclosed format.
            req.body.compliance_measure_ids = req.param('compliance_measure_ids')
                .split(',')
                .map(complianceMeasureId => `'${complianceMeasureId}'`)
                .join(',');

            const complianceMeasureIds = req.param('compliance_measure_ids');
            const userId = req.param('id');
            const validMeasureIds = await ComplianceService.checkValidComplianceMeasureIds(complianceMeasureIds, userId);

           if (validMeasureIds === false) {
               res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                   error: {
                       msg: 'You passed some invalid compliance measure ids.'
                   },
                   payload: Utils.extractRequestParams(req)
               }));

               return;
           }

           next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function checkComplianceMeasureIdsStateAccess(req, res, next) {
        const complianceMeasureIds = req.param('compliance_measure_ids');
        const spaceId = req.param('space_id');

        // Check if your location has access.

        try {
            const validMeasureIds = await ComplianceService.checkComplianceMeasureIdsStateAccess(complianceMeasureIds, spaceId);

            if (validMeasureIds.hasError) {
                return res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            data: {
                                msg: "Something went wrong when trying to check the compliance location access.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            }

            if (validMeasureIds === false) {
                res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: {
                        msg: 'You passed some invalid compliance measure ids (state access error).'
                    },
                    payload: Utils.extractRequestParams(req)
                }));

                return;
            }

            next();

        } catch (errors) {

        }
    }

    async function checkInsertForExistingEntries(req, res, next) {

        try {
            const complianceMeasureIds = req.param('compliance_measure_ids');
            const spaceId = req.param('space_id');

            const hasExistingEntries = await ComplianceService.checkInsertForExistingEntries(complianceMeasureIds, spaceId);

            if (hasExistingEntries.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            data: {
                                msg: "Something went wrong when trying to check the compliance for existing entries.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }


            if (hasExistingEntries === false) {
                res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: {
                        msg: 'There are already existing compliance records for the insert parameters provided.'
                    },
                    payload: Utils.extractRequestParams(req)
                }));

                return;
            }

            next();

        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: {
                    msg: 'Something went wrong when trying to check existing entries.'
                },
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function checkValidComplianceCategoryId(req, res, next) {

        req.assert('compliance_category_id', 'The compliance category id field must not be empty and must be valid.')
            .notEmpty()
            .hasEntries('`compliance_category`', 'id');


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

    async function checkUpdateComplianceContributorFields(req, res, next) {

        req.assert('email', 'The email field must not be empty and must be a valid email format.')
            .isEmail()
            .notEmpty();
        req.assert('compliance_id', 'The compliance_id field must not be empty and must be valid.')
            .notEmpty()
            .commaDelimitedValuesMustBeUnique();

        try {
            await req.asyncValidationErrors();

            const userId = req.param('id');
            const userType = req.param('user_type');
            const email = req.param('email');
            const complianceId = req.param('compliance_id').split(',');;

            let complianceHasAccess = await ComplianceService.getComplianceAccessPrivilege(complianceId, userId, userType);

            if (complianceHasAccess.hasError) {
                return res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            error: {
                                msg: JSON.stringify(complianceHasAccess.hasError),
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            }

            complianceHasAccess = parseFloat(complianceHasAccess[0]['compliance_access']);

            if (complianceHasAccess === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            error: {
                                msg: "You do not have access to this compliance item.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            // Check email.
            const user = await UserService.getUserByEmail(email);

            if (user.hasError) {
                return res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            error: {
                                msg: "Something went wrong when checking the user email.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            }

            if (user.length !== 0) {
                const userType = user[0]['user_type'];

                if (userType !== 'Compliance Certifier') {
                    return res.send(
                        Utils.responseBuilder(
                            500,
                            "FAIL",
                            "Query Failed.",
                            {
                                error: {
                                    msg: "This email account is already taken by a non Compliance Certifier.",
                                },
                                payload: Utils.extractRequestParams(req)
                            }
                        )
                    );
                }
            }
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }

        next();
    }

    async function locationTypeByCompanyMustHaveSpaces(req, res, next) {
        req.assert('location_type_id', 'The location type id field must not be empty and must be valid.')
            .notEmpty()
            .hasEntries('`location_type`', 'id');

        try {

            // Override for "other"
            if (req.param('location_type_id') !== "other") {
                await req.asyncValidationErrors();
            }

            // Check compliance IDS must not have repeating values.
            const userId = req.param('id');
            const companyId = req.param('company_id');
            const locationTypeId = req.param('location_type_id');
            const userType = req.param('user_type');

            const hasSpaces = await ComplianceService.locationTypeByCompanyIdHasSpaces(userId, companyId, locationTypeId, userType);

            if (!hasSpaces) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            error: {
                                msg: "This location type category has no spaces available.",
                            } ,
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            next();
        } catch (errors) {
            // Send here.
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function hasNoDependencies(req, res, next) {

        try {

            const complianceId = req.param('compliance_id');

            let dependencies = await ComplianceService.getDependencies(complianceId);

            res.send({
                dependencies: dependencies
            });

            // console.log('dependencies: ' + JSON.stringify(dependencies));
        } catch (errors) {

        }

        /*res.send({
            hahaha: 'hehehe'
        });

        return;*/
    }

    async function checkResultsDetail(req, res, next) {
        let isWellFormed = false;

    }

    async function checkComplianceAccessThroughComplianceResultId(req, res, next) {

        req.assert('compliance_result_detail_id', 'The compliance_result_detail_id field must not be empty and must be valid.')
            .notEmpty()
            .hasEntries('compliance_result_detail', 'id');

        req.assert('status', 'The status field must not be empty and must be valid.')
            .notEmpty()
            .inArrayValues(['pass', 'fail']);

        req.assert('date', 'The date field must not be empty and must be valid.')
            .notEmpty()
            .isValidDateFormat();

        req.assert('defect_type', 'The compliance_result_detail_id field must not be empty and must be valid.')
            .notEmpty()
            .inArrayValues(['Critical Defect', 'Non-Critical Defect']);

        try {
            await req.asyncValidationErrors();

            const complianceResultDetailId = req.param('compliance_result_detail_id');
            const userId = req.param('id');
            const userType = req.param('user_type');

            // Do something here.
            let complianceHasAccess = await ComplianceService.getComplianceAccessPrivilegeThroughResultDetailId(complianceResultDetailId, userId, userType);

            if (complianceHasAccess.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            data: {
                                msg: "Something went wrong when trying to check the compliance access.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            complianceHasAccess = parseFloat(complianceHasAccess[0]['compliance_access']);

            if (complianceHasAccess === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Query Failed.",
                        {
                            data: {
                                msg: "You do not have access to this compliance item.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }

    }
    async function complianceIdListValidator(req, res, next) {
        const complianceId = req.param('compliance_id');

        // Might need to change this later.
        const result = await ComplianceService.validateComplianceIds(complianceId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Company lookup failed.",
                    {
                        error: {
                            msg: "Something went wrong when trying to determine the validity of the compliance ids.",
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

        if (result === false) {

            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: {
                    msg: `You passed some non-valid compliance ids.`
                },
                payload: Utils.extractRequestParams(req)
            }));

            return;
        }

        next();
    }
    return {
        hasNoDependencies: hasNoDependencies,
        checkResultsDetail: checkResultsDetail,
        checkUpdateComplianceContributorFields: checkUpdateComplianceContributorFields,
        locationTypeByCompanyMustHaveSpaces: locationTypeByCompanyMustHaveSpaces,
        checkValidComplianceCategoryId: checkValidComplianceCategoryId,
        checkInsertForExistingEntries: checkInsertForExistingEntries,
        checkComplianceMeasureIdsStateAccess: checkComplianceMeasureIdsStateAccess,
        checkComplianceMeasureIds: checkComplianceMeasureIds,
        checkComplianceRequiredFields: checkComplianceRequiredFields,
        checkComplianceAccess: checkComplianceAccess,
        checkComplianceAccessThroughComplianceResultId: checkComplianceAccessThroughComplianceResultId,
        complianceIdListValidator: complianceIdListValidator
    }
})();

module.exports = Middlewares;