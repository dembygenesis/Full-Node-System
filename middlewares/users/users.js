const express = require('express'),
    _ = require('lodash'),
    UserService = require('../../services/users/users'),
    db = require('../../services/database/database'),
    Utils = require('../../services/utils');

const Middlewares = (function () {

    async function addUserRequiredFields(req, res, next) {
        req.assert('user_username', 'The username should not be empty, and should be unique.').notEmpty().hasNoEntries('\`user\`', 'username');
        ;
        req.assert('user_firstname', 'The firstname should not be empty.').notEmpty();
        req.assert('user_lastname', 'The lastname should not be empty.').notEmpty();
        req.assert('user_email', 'You must provide a valid and unique email.').notEmpty().isEmail().hasNoEntries('user', 'email');
        req.assert('user_mobile_number', 'You must provide a valid mobile number format.').notEmpty();
        req.assert('user_password', 'The password should not be empty.').notEmpty();
        req.assert('user_user_type_id', 'You must provide a valid user type ID.').notEmpty();

        try {
            await req.asyncValidationErrors();

            next();
        } catch (errors) {
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }

        /*req.asyncValidationErrors().then(function () {
            next();
        }).catch(function (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        });*/
    }

    async function updateUserRequiredFields(req, res, next) {
        req.assert('user_edit_id', 'must be a valid user id').notEmpty().hasEntries('`user`', 'id');
        req.assert('user_edit_username', 'must not be empty').notEmpty();

        // Enable editing w/o password.
        // req.assert('user_edit_password', 'must not be empty').notEmpty();
        req.assert('user_edit_firstname', 'must not be empty').notEmpty();
        req.assert('user_edit_lastname', 'must not be empty').notEmpty();
        req.assert('user_edit_email', 'must be a valid email format').notEmpty().isEmail();
        req.assert('user_edit_mobile_number', 'must be a valid mobile number').notEmpty();

        try {
            await req.asyncValidationErrors();

            // Do some logic.
            const userType = req.param('user_type');
            const managementCompanyId = req.param('management_company_id');

            const userToEdit = await UserService.getUserDetails(req.param('user_edit_id'), managementCompanyId, userType);

            console.log('userToEdit', userToEdit);

            if (userToEdit.hasError) {
                res.send(
                    Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                        error: {
                            msg: "Error fetching the user.",
                            sql: userToEdit.sql
                        },
                        payload: Utils.extractRequestParams(req)
                    })
                );

                return;
            }

            const userManagementCompanyId = req.param('management_company_id');

            const userToEditManagementCompanyId = userToEdit[0]['management_company_id'];
            const userToEditUserType = userToEdit[0]['user_type'];

            const permissionsCheck = UserService.getUserAccessRules(userType, userToEditUserType, userManagementCompanyId, userToEditManagementCompanyId);

            if (permissionsCheck.status === false) {
                res.send(
                    Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                        error: {
                            msg: permissionsCheck.msg,
                        },
                        payload: Utils.extractRequestParams(req)
                    })
                );

                return;
            }

            if (req.param('user_edit_password') === '')
                req.body.user_edit_password = null;

            next();
        } catch (errors) {
            console.log(errors);
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }
    async function approveUserRequiredFields(req, res, next) {
        req.assert('user_edit_id', 'must be a valid user id').notEmpty().hasEntries('`user`', 'id');

        try {
            await req.asyncValidationErrors();

            // Do some logic.
            const userType = req.param('user_type');
            const managementCompanyId = req.param('management_company_id');

            const userToEdit = await UserService.getUserDetails(req.param('user_edit_id'), managementCompanyId, userType);

            console.log('userToEdit', userToEdit);

            if (userToEdit.hasError) {
                res.send(
                    Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                        error: {
                            msg: "Error fetching the user.",
                            sql: userToEdit.sql
                        },
                        payload: Utils.extractRequestParams(req)
                    })
                );

                return;
            }

            const userManagementCompanyId = req.param('management_company_id');

            const userToEditManagementCompanyId = userToEdit[0]['management_company_id'];
            const userToEditUserType = userToEdit[0]['user_type'];

            const permissionsCheck = UserService.getUserAccessRules(userType, userToEditUserType, userManagementCompanyId, userToEditManagementCompanyId);

            if (permissionsCheck.status === false) {
                res.send(
                    Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                        error: {
                            msg: permissionsCheck.msg,
                        },
                        payload: Utils.extractRequestParams(req)
                    })
                );

                return;
            }

            next();
        } catch (errors) {
            console.log(errors);
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }
    async function updateUserSelfRequiredFields(req, res, next) {

        // Check if your ID is the same as you. Else. Quit.
        req.assert('user_firstname', 'The username you provided should be unique.').notEmpty();
        req.assert('user_lastname', 'The username you provided should be unique.').notEmpty();
        req.assert('user_id', 'The username you provided should be unique.').notEmpty();
        
        try {
            await req.asyncValidationErrors();

            console.log('I assumed passed');

            console.log(req.param('firstname'));

            const userId = parseFloat(req.param('user_id'));

            if (userId !== parseFloat(req.body.id)) {
                return res.send(
                    Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                        error: "You cannot update an account that is not your own.",
                        payload: Utils.extractRequestParams(req)
                    })
                );
            }

            next();
        } catch (errors) {
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }

    async function checkUsername(req, res, next) {
        req.assert('username', 'The username you provided should be unique.').notEmpty().hasNoEntries('user', 'username', '');

        try {
            await req.asyncValidationErrors();

            next();
        } catch (errors) {
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }

    function checkToBeCreatedUserType(req, res, next) {
        // You can only create administrators if you ARE an "Account Holder"
        // and not a super user.

        const userTypeId = req.param('user_type_id');
        const userToBeCreatedTypeId = req.param('type_id');

        // Prevent creation of super users for whatever reason.
        if (userToBeCreatedTypeId === 1) {
            res.send(
                Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                    error: "You cannot create a super user account.",
                    payload: Utils.extractRequestParams(req)
                })
            );
        } else if (userToBeCreatedTypeId === 3) {
            // Only allow administrators to be created by account holders.
            if (userTypeId === 2) {
                next();
            } else {
                res.send(
                    Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                        error: "Only Account Holders can create Administrators.",
                        payload: Utils.extractRequestParams(req)
                    })
                );
            }
        } else {
            next();
        }
    }
    async function checkApproveUserPrivileges(req, res, next) {

        const userType = req.param('user_type');
        const managementCompanyId = req.param('management_company_id');
        const userToBeDeletedId = req.param('user_edit_id');
        let userToBeDeletedType = null;

        let userToBeDeleted = await UserService.getUserDetails(userToBeDeletedId, managementCompanyId, userType);

        console.log('userToBeDeleted', userToBeDeleted)
        if (userToBeDeleted.hasError) {
            res.send(
                Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                    error: {
                        msg: "Error determining the user type of the user you are trying to delete.",
                        sql: userToBeDeleted.sql
                    },
                    payload: Utils.extractRequestParams(req)
                })
            );

            return;
        } else {
            userToBeDeletedType = userToBeDeleted[0]['user_type'];
        }

        const rulesCheck = UserService.getApproveUserRules(userType, userToBeDeletedType);

        if (rulesCheck.hasError) {
            res.send(
                Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                    error: {
                        msg: rulesCheck.msg.replace(/add/g, 'void'), // Hacky
                    },
                    payload: Utils.extractRequestParams(req)
                })
            );
        } else {
            next();
        }
    }
    async function checkVoidUserPrivileges(req, res, next) {

        const userType = req.param('user_type');
        const managementCompanyId = req.param('management_company_id');
        const userToBeDeletedId = req.param('user_id');
        let userToBeDeletedType = null;

        let userToBeDeleted = await UserService.getUserDetails(userToBeDeletedId, managementCompanyId, userType);

        if (userToBeDeleted.hasError) {
            res.send(
                Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                    error: {
                        msg: "Error determining the user type of the user you are trying to delete.",
                        sql: userToBeDeleted.sql
                    },
                    payload: Utils.extractRequestParams(req)
                })
            );

            return;
        } else {
            userToBeDeletedType = userToBeDeleted[0]['user_type'];
        }

        const rulesCheck = UserService.getAddUserRules(userType, userToBeDeletedType);

        if (rulesCheck.hasError) {
            res.send(
                Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                    error: {
                        msg: rulesCheck.msg.replace(/add/g, 'void'), // Hacky
                    },
                    payload: Utils.extractRequestParams(req)
                })
            );
        } else {
            next();
        }
    }

    async function checkAddUserPrivileges(req, res, next) {

        const userType = req.param('user_type');
        const userToBeCreatedTypeId = req.param('user_user_type_id');

        let userToBeCreatedType = await UserService.getUserTypeById(userToBeCreatedTypeId);

        if (userToBeCreatedType.hasError) {
            res.send(
                Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                    error: {
                        msg: "Error determining the user type account.",
                        sql: userToBeCreatedType.sql
                    },
                    payload: Utils.extractRequestParams(req)
                })
            );

            return;
        } else {
            userToBeCreatedType = userToBeCreatedType[0]['name'];
        }

        const rulesCheck = UserService.getAddUserRules(userType, userToBeCreatedType);

        if (rulesCheck.hasError) {
            res.send(
                Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                    error: {
                        msg: rulesCheck.msg,
                    },
                    payload: Utils.extractRequestParams(req)
                })
            );
        } else {
            next();
        }
    }

    async function voidUserRequiredFields(req, res, next) {
        req.assert('user_id', 'must be a valid user id').notEmpty().hasEntries('user', 'id');

        try {
            await req.asyncValidationErrors();

            next();
        } catch (errors) {
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }

    /**
     * Views data.
     */

    async function checkUserViewPrivilege(req, res, next) {

        req.assert('user_id', 'must be a valid user id').notEmpty().hasEntries('user', 'id');

        try {
            await req.asyncValidationErrors();

            const managementCompanyId = req.param('management_company_id');
            const userToEditId = req.param('user_id');
            const userType = req.param('user_type');
            const userToEdit = await UserService.getUserDetails(userToEditId, managementCompanyId, userType);

            if (userToEdit.length === 0) {
                return res.send(
                    Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                        error: {
                            msg: "User ID sent could not be validated.",
                            sql: userToEdit.sql
                        },
                        payload: Utils.extractRequestParams(req)
                    })
                );
            }

            // Append result to the request body to be returned in the controller if it passed all checks.
            req.body.user_details = userToEdit[0];

            // Prevent Super Admin updates.
            const userToEditUserType = userToEdit[0]['user_type'];

            // Depending who you are, you are not permitted to edit certain accounts.
            // Prevent updating of users under a different managing company.
            const userManagementCompanyId = req.param('management_company_id');
            const userToEditManagementCompanyId = userToEdit[0].management_company_id;

            const permissionsCheck = UserService.getUserAccessRules(userType, userToEditUserType, userManagementCompanyId, userToEditManagementCompanyId);

            if (permissionsCheck.status === false) {
                res.send(
                    Utils.responseBuilder(400, "FAILED_VALIDATION", "Failed validation.", {
                        error: {
                            msg: permissionsCheck.msg,
                        },
                        payload: Utils.extractRequestParams(req)
                    })
                );

                return;

            }

            next();

        } catch (errors) {
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }

    async function checkAllowedAccountTypes(req, res, next) {

        let result = await UserService.getAccountTypes();

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to fetch the account types.",
                    {
                        error: {
                            sql: 'Failed to fetch the account types.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

        let userType = req.param('user_type');

        switch (userType) {
            case 'Super Administrator':
                result = result.filter(accountType => {
                    return ['Account Holder', 'Manager', 'Administrator', 'Reviewer'].indexOf(accountType.name) !== -1;
                });

                break;
            case 'Account Holder':
                result = result.filter(accountType => {
                    return ['Account Holder', 'Administrator'].indexOf(accountType.name) !== -1;
                });

                break;
            case 'Administrator':
                result = result.filter(accountType => {
                    return ['Manager', 'Administrator', 'Reviewer'].indexOf(accountType.name) !== -1;
                });

                break;
        }

        if (result.length == 0) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Something went wrong when trying to filter the account types.",
                    {
                        error: {
                            msg: 'Something went wrong when trying to filter the account types.',
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }


        // Send to controller.
        req.body.allowedUserTypes = result;

        next();
    }


    async function checkMultiUserViewPrivilege(req, res, next) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        let conditions = '';

        if (userType === 'Super Administrator') {
            conditions = `(
                b.name IN (
                    'Account Holder',
                    'Administrator', 
                    'Manager', 
                    'Compliance Certifier', 
                    'Reviewer'
                )
            )`
        }

        if (userType === 'Account Holder') {
            conditions = `(
                b.name IN (
                    'Account Holder', 
                    'Administrator'
                )
            )`;
        }

        if (userType === 'Administrator') {
            conditions = `(
                b.name IN (
                    'Administrator', 
                    'Manager', 
                    'Compliance Certifier', 
                    'Reviewer'
                )
            )`;
        }

        if(userType === 'Super Administrator') {
            conditions += ` AND user.is_active IN (1, 2)`
        }else{
            conditions += ` AND user.is_active = 1`
        }

        let sql = `
          SELECT user.id   AS user_id,
                 user.username,
                 user.firstname,
                 user.lastname,
                 user.email,
                 user.mobile_number,
                 b.name AS user_type,
                 c.name AS management_company,
                 user.is_active as is_active,
                 (SELECT 
                            GROUP_CONCAT(DISTINCT(\`name\`) SEPARATOR '---') AS location
                        FROM
                            manager_assigned_location a
                            INNER JOIN location b 
                                ON 1 = 1 
                                AND a.location_id = b.id
                                AND b.is_active = 1
                        WHERE
                            1 = 1 AND a.user_id_assignee = user.id
                                AND a.is_active = 1) AS manager_assigned_locations
          FROM \`user\`
                 INNER JOIN user_type b
                            ON 1 = 1 
                                 AND user.user_type_id = b.id
                 INNER JOIN management_company c 
                            ON 1 = 1 
                                 AND user.management_company_id = c.id
          WHERE 1 = 1
            AND ${conditions}
            AND ${userType !== 'Super Administrator' ? "user.management_company_id = (SELECT management_company_id FROM \`user\` WHERE id = ?)": "1 = 1"}
        `;

        try {
            const query = await db.query(sql, [userId]);

            req.body.users = query;

            next();
        } catch (errors) {

            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Something went wrong when trying to query the account users.",
                    {
                        error: {
                            msg: 'Something went wrong when trying to query the account users.',
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function checkAddUserActivityRequiredFields(req, res, next) {
        req.assert('user_activity_category', 'You must pass a valid activity category.').notEmpty();
        req.assert('user_activity_entity', 'You must pass a valid activity entity.').notEmpty();

        try {
            await req.asyncValidationErrors();
            // Check activity and category.

            let userActivityCategory = req.param('user_activity_category');
            let userActivityEntity = req.param('user_activity_entity');

            const userActivityCategoryDetails = await UserService.getUserActivityCategoryByName(userActivityCategory);
            const userActivityEntityDetails = await UserService.getUserActivityEntityByName(userActivityEntity);

            if (userActivityCategoryDetails.length === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "You passed an invalid user activity category name.",
                        {
                            error: {
                                msg: 'You passed an invalid user activity category name.',
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            if (userActivityEntityDetails.length === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "You passed an invalid user activity entity name.",
                        {
                            error: {
                                msg: 'You passed an invalid user activity entity name.',
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            console.log(userActivityCategoryDetails);
            console.log(userActivityEntityDetails);

            req.body.user_activity_category_id = userActivityCategoryDetails[0]['id'];
            req.body.user_activity_entity_id = userActivityEntityDetails[0]['id'];

            next();
        } catch (errors) {
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }

    async function addManagementCompanyRequiredFields(req, res, next) {
        req.assert('firstname', 'The firstname field must not be empty.').notEmpty();
        req.assert('lastname', 'The lastname field must not be empty.').notEmpty();
        req.assert('email', 'The email field must not be empty, UNIQUE, and must a valid email format.').notEmpty().isEmail()
            .hasNoEntries('`user`', 'email');
        req.assert('management_company', 'You must pass a non-empty and unique management company name.').notEmpty()
            .hasNoEntries('management_company', '`name`');

        try {
            await req.asyncValidationErrors();

            next();
        } catch (errors) {
            res.send(
                Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                    error: Utils.extractErrorMessages(errors),
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }

    async function checkUserCreatedEntries(req, res, next) {
        let userId = req.param('user_id');
        let result = await UserService.checkUserCreatedEntries(userId);

        if (result.length !== 0) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "You passed an invalid user activity entity name.",
                    {
                        error: {
                            msg: 'You have some entities dependent: ' + JSON.stringify(result),
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        next();
    }

    return {

        checkUserCreatedEntries: checkUserCreatedEntries,

        /**
         * Management Company..
         */
        addManagementCompanyRequiredFields: addManagementCompanyRequiredFields,

        /**
         * Views.
         */
        checkAddUserActivityRequiredFields: checkAddUserActivityRequiredFields,
        checkAllowedAccountTypes: checkAllowedAccountTypes,
        checkUserViewPrivilege: checkUserViewPrivilege,
        checkMultiUserViewPrivilege: checkMultiUserViewPrivilege,


        /**
         * CRUD.
         */
        addUserRequiredFields: addUserRequiredFields,
        voidUserRequiredFields: voidUserRequiredFields,
        updateUserRequiredFields: updateUserRequiredFields,
        approveUserRequiredFields: approveUserRequiredFields,
        updateUserSelfRequiredFields: updateUserSelfRequiredFields,

        /**
         * CRUD Middleware.
         */
        checkAddUserPrivileges: checkAddUserPrivileges,
        checkVoidUserPrivileges: checkVoidUserPrivileges,
        checkApproveUserPrivileges: checkApproveUserPrivileges,
        checkUsername: checkUsername,
        checkToBeCreatedUserType: checkToBeCreatedUserType,
    }
})();

module.exports = Middlewares;