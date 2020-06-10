const express = require('express'),
    _ = require('lodash'),
    UserService = require('../../services/users/users'),
    moment = require('moment'),
    AuthService = require('../../services/auth/auth'),
    Utils = require('../../services/utils'),
    ManagementCompanyService = require('../../services/managementCompany/managementCompany'),
    LocationService = require('../../services/location/location');

const Middlewares = (function () {

    function authRequiredFields(req, res, next) {
        req.assert('username', 'must not be empty').notEmpty();
        req.assert('password', 'must not be empty').notEmpty();

        req.asyncValidationErrors().then(function () {
            next();
        }).catch(function (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        });
    }

    function isTokenExpired(timestamp) {
        console.log('timestamp', timestamp);

        const timeDifference = moment(timestamp).diff(moment());

        return timeDifference < 1;
    }

    function authHandler(req, res, next, validUserTypeIds) {
        req.assert('token', 'must not be empty').notEmpty();

        req.asyncValidationErrors().then(function () {

            // Append user id through token.
            const token = req.param('token');

            AuthService.getUserPropertiesByToken(token)
                .then(result => {
                    if (result.length === 1) {
                        const userTypeId = parseFloat(result[0].user_type_id);
                        const userId = parseFloat(result[0].id);
                        const tokenExpiry = result[0].token_expiry;

                        if (isTokenExpired(tokenExpiry)) {
                            res.send(
                                Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                                    error: "Your token has already expired. Please login again.",
                                    payload: Utils.extractRequestParams(req)
                                })
                            );

                            return;
                        }

                        if (validUserTypeIds.indexOf(userTypeId) !== -1) {
                            // Append properties and proceed.
                            req.body.user_type_id = userTypeId;
                            req.body.id = userId;

                            next();
                        } else {
                            res.send(
                                Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                                    error: "You don't have privileges to use this API command.",
                                    payload: Utils.extractRequestParams(req)
                                })
                            );
                        }
                    } else {
                        res.send(
                            Utils.responseBuilder(500, "FAILED_VALIDATION", "Failed validation.", {
                                error: "Invalid token.",
                                payload: Utils.extractRequestParams(req)
                            })
                        );
                    }
                })
                .catch(err => {
                    res.send(
                        Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                            error: {
                                msg: "Something went wrong when trying to check the token.",
                                err: err
                            },
                            payload: Utils.extractRequestParams(req)
                        })
                    );
                });

            // next();
        }).catch(function (errors) {
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                }));
        });
    }

    function isAccountHolder(req, res, next) {

        // Hacky improvement to make sure no code that uses this breaks.
        const userType = req.param('user_type');

        if (userType === 'Account Holder') {
            next();

            return;
        }

        authHandler(req, res, next, [2]);
    }

    async function validateTokenAndExtractAccountType(req, res, next) {

        req.assert('token', 'must not be empty').notEmpty();

        try {
            await req.asyncValidationErrors();

            const token = req.param('token');

            try {
                const userDetails = await AuthService.getUserPropertiesByToken(token);
                console.log(userDetails)
                const userDetailsCompany = await ManagementCompanyService.getManagementCompanyDetails(userDetails[0].management_company_id);
                const userDetailsLocation = await LocationService.getLocationsPaymentStatusByManagementId(userDetails[0].management_company_id, userDetails[0].id, userDetails[0].user_type);
                if (userDetails.length === 0) {

                    res.send(
                        Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                            error: {
                                msg: "Token not found.",
                                error: {}
                            },
                            payload: Utils.extractRequestParams(req)
                        })
                    );

                    return;
                }

                const userId = userDetails[0]['id']
                    , userTypeId = userDetails[0]['user_type_id']
                    , userFirstName = userDetails[0]['firstname']
                    , userLastName = userDetails[0]['lastname']
                    , managementCompanyId = userDetails[0]['management_company_id']
                    , tokenExpiry = userDetails[0]['token_expiry'] // Changed use.
                    , tokenExpired = parseFloat(userDetails[0]['token_expired'])
                    , userAccountType = userDetails[0]['user_type'];
                
                if (tokenExpired) {
                    res.send(
                        Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                            error: {
                                msg: "Token has already expired.",
                                error: {}
                            },
                            payload: Utils.extractRequestParams(req)
                        })
                    );

                    return;
                }

                req.body.user_type = userAccountType;
                req.body.firstname = userFirstName;
                req.body.lastname = userLastName;
                req.body.management_company_id = managementCompanyId;
                req.body.user_type_id = parseFloat(userTypeId);
                req.body.id = parseFloat(userId);
                req.body.company = userDetailsCompany[0]
                req.body.location = userDetailsLocation

                next();
            } catch (errors) {
                console.log(errors);

                res.send(
                    Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                        error: {
                            msg: "Something went wrong when trying to check the token.",
                            errors: errors
                        },
                        payload: Utils.extractRequestParams(req)
                    })
                );
            }

        } catch (errors) {
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }

    function isAdministratorOrAccountHolder(req, res, next) {
        const userType = req.param('user_type');

        if (userType === 'Administrator' || userType === 'Account Holder') {
            next();

            return;
        }

        res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Only administrator accounts are allowed to use this command.",
                {
                    error: {
                        msg: "Only administrator accounts are allowed to use this command.",
                    },
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    function isAdministratorOrAccountHolderOrReviewer(req, res, next) {
        const userType = req.param('user_type');

        if (userType === 'Administrator' || userType === 'Account Holder') {
            next();

            return;
        }

        if (userType === 'Reviewer') {
            next();

            return;
        }

        res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Only administrator/manager accounts are allowed to use this command.",
                {
                    error: {
                        msg: "Only administrator/manager accounts are allowed to use this command.",
                    },
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    function isAdministratorOrAccountHolderOrManager(req, res, next) {
        const userType = req.param('user_type');

        if (userType === 'Administrator' || userType === 'Account Holder' || userType === 'Manager' ) {
            next();

            return;
        }

        res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Only administrator/manager accounts are allowed to use this command.",
                {
                    error: {
                        msg: "Only administrator/manager accounts are allowed to use this command.",
                    },
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    function isAdministratorOrAccountHolderOrComplianceContributor(req, res, next) {
        const userType = req.param('user_type');

        if (userType === 'Administrator' || userType === 'Account Holder' || userType === 'Compliance Certifier') {
            next();

            return;
        }

        res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Only Administrators or Compliance Certifier accounts are allowed to use this command.",
                {
                    error: {
                        msg: "Only Administrators or Compliance Certifier accounts are allowed to use this command.",
                    },
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    function isAdministratorOrAccountHolderOrComplianceContributorOrManager(req, res, next) {
        const userType = req.param('user_type');

        if (userType === 'Administrator' || userType === 'Account Holder' || userType === 'Compliance Certifier' || userType === 'Manager') {
            next();

            return;
        }

        res.send(
            Utils.responseBuilder(
                500,
                "FAIL",
                "Only Administrators or Compliance Certifier accounts are allowed to use this command.",
                {
                    error: {
                        msg: "Only Administrators or Compliance Certifier accounts are allowed to use this command.",
                    },
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    function isOfAccount(userTypes) {
        return async function (req, res, next) {
            const userType = req.param('user_type');
            
            if (userTypes.indexOf(userType) !== -1) {
                return next();
            }

            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    `Only ${JSON.stringify(userTypes)} accounts are allowed to use this command.`,
                    {
                        error: {
                            msg: `Only ${JSON.stringify(userTypes)} accounts are allowed to use this command.`,
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    return {
        authRequiredFields: authRequiredFields,
        validateTokenAndExtractAccountType: validateTokenAndExtractAccountType,
        isOfAccount: isOfAccount,
        isAccountHolder: isAccountHolder,
        isAdministratorOrAccountHolder: isAdministratorOrAccountHolder,
        isAdministratorOrAccountHolderOrReviewer: isAdministratorOrAccountHolderOrReviewer,
        isAdministratorOrAccountHolderOrManager: isAdministratorOrAccountHolderOrManager,
        isAdministratorOrAccountHolderOrComplianceContributor: isAdministratorOrAccountHolderOrComplianceContributor,
        isAdministratorOrAccountHolderOrComplianceContributorOrManager: isAdministratorOrAccountHolderOrComplianceContributorOrManager,
    }
})();

module.exports = Middlewares;