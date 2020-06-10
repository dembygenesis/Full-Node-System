const express = require('express'),
    _ = require('lodash'),
    UserService = require('../../services/users/users'),
    db = require('../../services/database/database'),
    LocationService = require('../../services/location/location'),
    CompanyService = require('../../services/companies/companies'),
    Utils = require('../../services/utils');

const Middlewares = (function () {

    async function checkLocationRequiredFields(req, res, next) {

        req.assert('name', 'The name field must not be empty.').notEmpty();
        req.assert('street_name', 'The street name field must not be empty.').notEmpty();
        req.assert('street_number', 'The street number field must not be empty.').notEmpty();
        req.assert('suburb', 'The suburb field must not be empty.').notEmpty();
        req.assert('postal_code', 'The postal code field must not be empty.').notEmpty();
        req.assert('company_id', 'The company id field must not be empty and must be valid.').notEmpty().hasEntries('`company`', 'id', 1);
        req.assert('location_type_id', 'The location type id field must not be empty and must be valid.').notEmpty().hasEntries('`location_type`', 'id');

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

    async function locationIsCreatedByClient(req, res, next) {

        req.assert('location_id', 'The location id field must be a valid entry.')
            .notEmpty()
            .hasEntries('`location`', 'id');

        try {
            await req.asyncValidationErrors();

            const userId = req.param('id');
            const locationId = req.param('location_id');

            try {
                const result = await LocationService.getLocationByLocationAndUserId(locationId, userId);

                if (result.hasError) {
                    res.send(
                        Utils.responseBuilder(
                            500,
                            "FAIL",
                            "User Adding Failed.",
                            {
                                data: {
                                    msg: "Something went wrong when trying to check the location by user id.",
                                },
                                operation: 'ADD_FAIL',
                                payload: Utils.extractRequestParams(req)
                            }
                        )
                    );

                    return;
                }

                // Has no error? Check length.
                if (result.length === 0) {
                    res.send(
                        Utils.responseBuilder(
                            500,
                            "FAIL",
                            "User Adding Failed.",
                            {
                                data: {
                                    msg: "Account Holders are only able to manage locations that they created.",
                                },
                                operation: 'ADD_FAIL',
                                payload: Utils.extractRequestParams(req)
                            }
                        )
                    );

                    return;
                }

                req.body.location_data = result;

                next();
            } catch (errors) {

            }

        } catch (errors) {
            // Send here.
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function locationHasAccessThroughCompaniesAssigned(req, res, next) {

        req.assert('location_id', 'The location id field must be a valid entry.')
            .notEmpty()
            .hasEntries('`location`', 'id', 1);

        try {
            await req.asyncValidationErrors();

            const userId = req.param('id');
            const userType = req.param('user_type');
            const locationId = req.param('location_id');
            const managementCompanyId = req.param('management_company_id');

            try {
                const result = await LocationService.getLocationAccessThroughCompaniesAssigned(locationId, userId, userType, managementCompanyId);

                if (result.hasError) {
                    res.send(
                        Utils.responseBuilder(
                            500,
                            "FAIL",
                            "User Adding Failed.",
                            {
                                data: {
                                    msg: "Something went wrong when trying to check the location by user id.",
                                },
                                operation: 'ADD_FAIL',
                                payload: Utils.extractRequestParams(req)
                            }
                        )
                    );

                    return;
                }

                if (result.length === 0) {
                    res.send(
                        Utils.responseBuilder(
                            500,
                            "FAIL",
                            "User Adding Failed.",
                            {
                                data: {
                                    msg: `${userType} are only able to manage locations that they have been assigned.`,
                                },
                                operation: 'ADD_FAIL',
                                payload: Utils.extractRequestParams(req)
                            }
                        )
                    );

                    return;
                }

                req.body.location_data = result;

                next();
            } catch (errors) {

            }

        } catch (errors) {
            // Send here.
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function checkLocationId(req, res, next) {

        req.assert('location_id', 'The location id field must be a valid entry.')
            .notEmpty()
            .hasEntries('`location`', 'id', 1);

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

    async function isValidState(req, res, next) {
        req.assert('state', 'The state field must be a valid entry.')
            .notEmpty()
            .hasEntries('`austrailia_states`', 'state');

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

    async function isValidPostalCode(req, res, next) {
        req.assert('state', 'The state field must be a valid entry.')
            .notEmpty()
            .hasEntries('`austrailia_states`', 'state');

        req.assert('postal_code', 'The postcode field must be a valid entry.')
            .notEmpty()
            .hasEntries('`austrailia_postcodes`', 'postcode');

        try {
            await req.asyncValidationErrors();

            const state = req.param('state');
            const postalCode = req.param('postcode');

            let result = await LocationService.getPostCodeByState(postalCode, state);

            if (result.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Validation failed.",
                        {
                            data: {
                                msg: "Something went wrong when trying to check the postal code.",
                            },
                            operation: 'ADD_FAIL',
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            if (result.length === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "User Adding Failed.",
                        {
                            data: {
                                msg: "Invalid postal code and state combination provided.",
                            },
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

    async function assignLocationToManagerRequiredFields(req, res, next) {

        req.assert('user_ids', 'User ids should not be empty.').notEmpty();

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

    async function userIdListValidator(req, res, next) {
        const userIds = req.param('user_ids');

        // Might need to change this later.
        const validUserTypes = ['Manager', 'Reviewer'];
        const result = await CompanyService.validateUserIds(userIds, validUserTypes);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Company lookup failed.",
                    {
                        error: {
                            msg: "Something went wrong when trying to determine the validity of the user ids.",
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
                    msg: `You passed some non-valid user ids. Only ${JSON.stringify(validUserTypes)} are allowed.`
                },
                payload: Utils.extractRequestParams(req)
            }));

            return;
        }

        next();
    }

    async function assignedManagerCompanyHasNoCurrentActive (req, res, next) {

        const userIds = req.param('user_ids');
        const locationId = req.param('location_id');

        const result = await LocationService.assignedManagerCompanyHasNoCurrentActive(userIds, locationId);

        if (result === false) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Location lookup failed.",
                    {
                        error: {
                            msg: "Some managers assigned already have this privilege.",
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        next();
    }

    async function hasNoDependencies(req, res, next) {
        const locationId = req.param('location_id');

        let dependencies = await LocationService.getDependencies(locationId);

        if (dependencies.length > 0) {
            dependencies = JSON.stringify( dependencies.map(dependency => dependency.name) );

            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Dependency validation failed.",
                    {
                        error: {
                            msg: `This location has spaces which are dependent on it: ${dependencies}. Please remove them first.`,
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        next();
    }

    return {
        hasNoDependencies: hasNoDependencies,
        assignedManagerCompanyHasNoCurrentActive: assignedManagerCompanyHasNoCurrentActive,
        isValidState: isValidState,
        userIdListValidator: userIdListValidator,
        isValidPostalCode: isValidPostalCode,
        checkLocationRequiredFields: checkLocationRequiredFields,
        assignLocationToManagerRequiredFields: assignLocationToManagerRequiredFields,
        locationIsCreatedByClient: locationIsCreatedByClient,
        locationHasAccessThroughCompaniesAssigned: locationHasAccessThroughCompaniesAssigned,
        checkLocationId: checkLocationId,
    }
})();

module.exports = Middlewares;