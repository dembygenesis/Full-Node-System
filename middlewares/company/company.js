const express = require('express'),
    _ = require('lodash'),
    CompanyService = require('../../services/companies/companies'),
    Utils = require('../../services/utils');

const Middleware = (function () {

    async function saveCreditCardRequiredFields(req, res, next) {

        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty();
        req.assert('selected_month', 'The Selected Month field must not be empty').notEmpty();
        req.assert('selected_year', 'The Selected Year name field must not be empty').notEmpty();
        req.assert('card_number', 'The Card Number field must not be empty').notEmpty();
        req.assert('card_code', 'The CVC field must not be empty').notEmpty();

        req.assert('contact_name', 'The contact name field must not be empty').notEmpty();

        // Billing.
        req.assert('billing_street_number', 'The billing street number field must not be empty').notEmpty();
        req.assert('billing_street_name', 'The billing street name field field must not be empty').notEmpty();
        req.assert('billing_suburb', 'The billing suburb field must not be empty').notEmpty();
        req.assert('billing_post_code', 'The billing post code field must not be empty and be valid.').notEmpty().hasEntries('austrailia_postcodes', 'postcode');

        try {
            await req.asyncValidationErrors();

            // Query name here to check against the next middleware.
            const companyId = req.param('company_id');
            const company = await CompanyService.getCompanyById(companyId);
            let companyName = null;

            if (company.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "Something went wrong with trying to check the company.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                companyName = company[0]['name'];
            }

            req.body.company_name = companyName;

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function updateCompanyRequiredFields(req, res, next) {

        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty();
        req.assert('name', 'The name field must not be empty').notEmpty();
        req.assert('contact_name', 'The contact name field must not be empty').notEmpty();

        // Billing.
        req.assert('billing_street_number', 'The billing street number field must not be empty').notEmpty();
        req.assert('billing_street_name', 'The billing street name field field must not be empty').notEmpty();
        req.assert('billing_suburb', 'The billing suburb field must not be empty').notEmpty();
        req.assert('billing_post_code', 'The billing post code field must not be empty and be valid.').notEmpty().hasEntries('austrailia_postcodes', 'postcode');
        // Billing.

        req.assert('email', 'The "email" must be a valid email format').notEmpty().isEmail();
        req.assert('acn_vcn', 'The ABN field must not be empty').notEmpty();
        // req.assert('mobile_number', 'The mobile number field must not be empty').hasEntriesOrEmpty();
        req.assert('telephone_number', 'The telephone number field must not be empty').notEmpty();
        req.assert('purchase_order_number', 'The purchase order number field must not be empty').notEmpty();

        try {
            await req.asyncValidationErrors();

            // Query name here to check against the next middleware.
            const companyId = req.param('company_id');
            const company = await CompanyService.getCompanyById(companyId);
            let companyName = null;

            if (company.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "Something went wrong with trying to check the company.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                companyName = company[0]['name'];
            }

            req.body.company_name = companyName;

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function voidCompanyRequiredFields(req, res, next) {

        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty();

        try {
            await req.asyncValidationErrors();

            // Query name here to check against the next middleware.
            const companyId = req.param('company_id');
            const company = await CompanyService.getCompanyById(companyId);
            let companyName = null;
            let companyCreatedBy = null;

            if (company.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "Something went wrong with trying to check the company.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                companyName = company[0]['name'];
                companyCreatedBy = company[0]['created_by'];
            }

            req.body.company_name = companyName;
            req.body.company_created_by = companyCreatedBy;

            next();
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    function addCompanyRequiredFields(req, res, next) {

        /**
         * name,
         acn_vcn,
         mobile_number,
         telephone_number,
         created_by
         */

        req.assert('name', 'The name field must not be empty').notEmpty();

        // Billing.
        req.assert('billing_street_number', 'The billing street number field must not be empty').notEmpty();
        req.assert('billing_street_name', 'The billing street name field field must not be empty').notEmpty();
        req.assert('billing_suburb', 'The billing suburb field must not be empty').notEmpty();
        req.assert('billing_post_code', 'The billing post code field must not be empty and be valid.').notEmpty().hasEntries('austrailia_postcodes', 'postcode');

        req.assert('contact_name', 'The contact name field must not be empty').notEmpty();
        req.assert('email', 'The "email" must be a valid email format').notEmpty().isEmail();
        req.assert('acn_vcn', 'The ABN field must not be empty').notEmpty();
        // req.assert('mobile_number', 'The mobile number field must not be empty').hasEntriesOrEmpty();
        req.assert('telephone_number', 'The telephone number field must not be empty').notEmpty();
        req.assert('purchase_order_number', 'The purchase order number field must not be empty').notEmpty();

        req.asyncValidationErrors().then(function () {
            if (typeof req.param('mobile_number') === "undefined") {
                req.body.mobile_number = '';
            }

            next();
        }).catch(function (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        });
    }

    async function checkNameToUpdate(req, res, next) {
        const companyIdToEdit = req.param('company_id');

        req.assert('name', 'The new company you want to change into already exists - must be unique.').notEmpty()
            .hasNoEntriesExceptOwn('company', 'name', companyIdToEdit);

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

    async function checkNameExceptOwn(req, res, next) {

        const companyId = req.param('company_id');
        const companyName = req.param('name');
        const managementCompanyId = req.param('management_company_id');

        const hasNoDuplicates = await CompanyService.companyHasNoDuplicates(companyName, managementCompanyId, companyId);

        if (hasNoDuplicates === false) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed add company.",
                    {
                        error: {
                            msg: 'Company has duplicates.',
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        next();
    }

    async function checkName(req, res, next) {

        const companyName = req.param('name');
        const managementCompanyId = req.param('management_company_id');

        const hasNoDuplicates = await CompanyService.companyHasNoDuplicates(companyName, managementCompanyId);

        if (hasNoDuplicates === false) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed add company.",
                    {
                        error: {
                            msg: 'Company has duplicates.',
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        next();
    }

    async function isAccountHolder(req, res, next) {
        const userType = req.param('user_type');

        if (userType !== 'Account Holder') {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed add company.",
                    {
                        error: {
                            msg: 'Only Account Holders can create/read/update/delete companies.',
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

        next();
    }

    function companyOwnedByUserDeleting(req, res, next) {
        const userId = req.param('id');
        const createdBy = req.param('company_created_by');

        if (userId !== createdBy) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to delete company.",
                    {
                        error: {
                            msg: 'Permission error. Account holders can only delete companies that they own.',
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

        next();
    }

    async function assignCompanyToUsersRequiredFields(req, res, next) {
        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty();
        req.assert('user_ids', 'User ids should not be empty.').notEmpty();

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

    async function assignCompanyToReviewersRequiredFields(req, res, next) {
        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty();
        req.assert('user_ids', 'User ids should not be empty.').notEmpty();

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

    async function userIdListValidator(req, res, next) {
        const userIds = req.param('user_ids');

        // Might need to change this later.
        const validUserTypes = ['Account Holder', 'Administrator'];
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

    async function reviewerIdListValidator(req, res, next) {
        const userIds = req.param('user_ids');

        const validUserTypes = ['Reviewer'];
        const result = await CompanyService.validateUserIds(userIds, validUserTypes);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Reviewer lookup failed.",
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

    async function userListMustBeCreatedByClient(req, res, next) {
        const userIds = req.param('user_ids');
        const clientId = req.param('id');

        const validateUserIds = await CompanyService.validateUserIdsCreatedByClient(clientId, userIds);

        if (validateUserIds === false) {

            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: {
                    msg: 'You passed some user ids that were not created by you.'
                },
                payload: Utils.extractRequestParams(req)
            }));

            return;
        }

        next();
    }

    async function userListMustInSameManagementCompanyAsClient(req, res, next) {
        const userIds = req.param('user_ids');
        const managementCompanyId = req.param('management_company_id');

        const validateUserIds = await CompanyService.validateUserIdsHasSameManagementCompanyAsClient(managementCompanyId, userIds);

        if (validateUserIds === false) {

            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: {
                    msg: 'You passed some user ids that were not created by you.'
                },
                payload: Utils.extractRequestParams(req)
            }));

            return;
        }

        next();
    }

    async function companyMustBeOwnedByClient(req, res, next) {

        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty().hasEntries('`company`', 'id');

        try {
            await req.asyncValidationErrors();

            const creatorId = req.param('id');
            const companyId = req.param('company_id');

            const result = await CompanyService.getCompanyByCreatorAndId(creatorId, companyId);

            let companyCount = null;

            if (result.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "Error determining the company owner.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            } else {
                companyCount = parseFloat(result[0]['company_count']);
            }

            if (companyCount === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "You cannot manipulate companies that you did not create.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                next();
            }
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function companyMustBeOwnedOrAssignedByClient(req, res, next) {

        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty().hasEntries('`company`', 'id', 1);
        
        try {
            await req.asyncValidationErrors();

            const creatorId = req.param('id');
            const userType = req.param('user_type');
            const companyId = req.param('company_id');

            const result = await CompanyService.getCreatedOrAssignedCompaniesByCreatorAndId(creatorId, companyId, userType);

            let companyCount = null;

            if (result.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "Error determining the company owner.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            } else {
                companyCount = parseFloat(result[0]['company_count']);
            }

            if (companyCount === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "You cannot manipulate companies that you did not create or were not assigned.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                next();
            }
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function locationMustBeOwnedOrAssignedByClient(req, res, next) {

        req.assert('location_id', 'Location id must be valid and should not be empty.').notEmpty().hasEntries('`location`', 'id');

        try {
            await req.asyncValidationErrors();

            const creatorId = req.param('id');
            const companyId = req.param('company_id');

            const result = await CompanyService.getCreatedOrAssignedCompaniesByCreatorAndId(creatorId, companyId);

            let companyCount = null;

            if (result.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "Error determining the company owner.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            } else {
                companyCount = parseFloat(result[0]['company_count']);
            }

            if (companyCount === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "You cannot manipulate companies that you did not create or were not assigned.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                next();
            }
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function companyMustBeAssignedByClient(req, res, next) {

        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty().hasEntries('company', 'id', 1);

        try {
            await req.asyncValidationErrors();

            const creatorId = req.param('id');
            const companyId = req.param('company_id');
            const userType = req.param('user_type');

            const result = await CompanyService.getAssignedCompaniesByCreatorAndId(creatorId, companyId, userType);
            
            let companyCount = null;

            if (result.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "Error determining the company owner.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            } else {
                companyCount = parseFloat(result[0]['company_count']);
            }

            if (companyCount === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "You cannot manipulate companies that you did not create or were not assigned.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                next();
            }
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function locationTypeMustBeAssignedByClient(req, res, next) {

        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty().hasEntries('company', 'id');
        req.assert('location_type_id', 'Company id must be valid and should not be empty.').notEmpty().hasEntries('company', 'id');

        try {
            await req.asyncValidationErrors();

            const creatorId = req.param('id');
            const companyId = req.param('company_id');
            const userType = req.param('user_type');

            const result = await CompanyService.getAssignedCompaniesByCreatorAndId(creatorId, companyId, userType);

            let companyCount = null;

            if (result.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "Error determining the company owner.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            } else {
                companyCount = parseFloat(result[0]['company_count']);
            }

            if (companyCount === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "You cannot manipulate companies that you did not create or were not assigned.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                next();
            }
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function companyMustBeInSimilarManagementCompany(req, res, next) {

        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty().hasEntries('`company`', 'id');

        try {
            await req.asyncValidationErrors();

            const managementCompanyId = req.param('management_company_id');
            const companyId = req.param('company_id');

            const result = await CompanyService.companyMustBeInSimilarManagementCompany(companyId, managementCompanyId);

            let companyCount = null;

            if (result.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "Error determining the company owner.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            } else {
                companyCount = parseFloat(result[0]['company_count']);
            }

            if (companyCount === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Company lookup failed.",
                        {
                            error: {
                                msg: "You cannot manipulate companies that are under a different management company.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            } else {
                next();
            }
        } catch (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function companyIdIsValid(req, res, next) {
        req.assert('company_id', 'Company id must be valid and should not be empty.').notEmpty();

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

    async function checkAccountTypeAccessAssignmentRules(req, res, next) {
        const userId = req.param('id');
        const userIds = req.param('user_ids');
        const companyId = req.param('company_id');
        const userType = req.param('user_type');

        const result = CompanyService.getAccountTypeAccessAssignmentRules(userId, userIds, companyId, userType);

        res.send('dteretmined');
    }

    async function assignedAccountHolderCompanyHasNoCurrentActive (req, res, next) {

        const userIds = req.param('user_ids');
        const companyId = req.param('company_id');

        const result = await CompanyService.assignedAccountHolderCompanyHasNoCurrentActive(userIds, companyId);

        if (result === false) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Company lookup failed.",
                    {
                        error: {
                            msg: "Some users assigned already have this privilege.",
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        next();
    }

    async function assignedReviewerCompanyHasNoCurrentActive (req, res, next) {

        const userIds = req.param('user_ids');
        const companyId = req.param('company_id');

        const result = await CompanyService.assignedReviewerCompanyHasNoCurrentActive(userIds, companyId);

        if (result === false) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Company lookup failed.",
                    {
                        error: {
                            msg: "Some users assigned already have this privilege.",
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        next();
    }

    async function hasNoDependencies(req, res, next) {
        const companyId = req.param('company_id');

        let result = await CompanyService.hasNoDependencies(companyId);

        if (result.length !== 0) {

            result = JSON.stringify( result.map(val => val.name ) );

            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Checks failed.",
                    {
                        error: {
                            msg: `This company is tied to active locations. Please void these locations first: ${result}`,
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
        assignedReviewerCompanyHasNoCurrentActive: assignedReviewerCompanyHasNoCurrentActive,
        assignedAccountHolderCompanyHasNoCurrentActive: assignedAccountHolderCompanyHasNoCurrentActive,
        locationMustBeOwnedOrAssignedByClient: locationMustBeOwnedOrAssignedByClient,
        companyMustBeAssignedByClient: companyMustBeAssignedByClient,
        companyMustBeInSimilarManagementCompany: companyMustBeInSimilarManagementCompany,
        checkAccountTypeAccessAssignmentRules: checkAccountTypeAccessAssignmentRules,
        companyIdIsValid: companyIdIsValid,
        companyMustBeOwnedByClient: companyMustBeOwnedByClient,
        companyMustBeOwnedOrAssignedByClient: companyMustBeOwnedOrAssignedByClient,
        userListMustBeCreatedByClient: userListMustBeCreatedByClient,
        userListMustInSameManagementCompanyAsClient: userListMustInSameManagementCompanyAsClient,
        userIdListValidator: userIdListValidator,
        reviewerIdListValidator: reviewerIdListValidator,
        assignCompanyToUsersRequiredFields: assignCompanyToUsersRequiredFields,
        assignCompanyToReviewersRequiredFields: assignCompanyToReviewersRequiredFields,
        addCompanyRequiredFields: addCompanyRequiredFields,
        updateCompanyRequiredFields: updateCompanyRequiredFields,
        voidCompanyRequiredFields: voidCompanyRequiredFields,
        companyOwnedByUserDeleting: companyOwnedByUserDeleting,
        checkName: checkName,
        checkNameExceptOwn: checkNameExceptOwn,
        checkNameToUpdate: checkNameToUpdate,
        isAccountHolder: isAccountHolder,
        saveCreditCardRequiredFields: saveCreditCardRequiredFields
    }
})();

module.exports = Middleware;