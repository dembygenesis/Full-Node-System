var express = require('express'),
    UserService = require('../../services/users/users'),
    CompanyService = require('../../services/companies/companies'),
    EmailService = require('../../services/email/email'),
    EmailServiceV2 = require('../../services/email/email2'),
    db = require('../../services/database/database'),
    Utils = require('../../services/utils');

const Users = (function () {

    function getSampleData(req, res) {


        const connection = db.getMySQL_connection();

        connection.beginTransaction(() => {
            // Promisify connection.
            const promisedConnection = (stmt, args) => new Promise((resolve, reject) => {
                connection.query(stmt, args, (err, rows, fields) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            // Determine if the user exists, else - create it.


            promisedConnection('SELECT * FROM location', [])
                .then(res => {
                    console.log(res);
                })
        });

        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Here's the config.",
                {
                    data: database,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function addUser(req, res) {

        const userId = req.param('id');
        const username = req.param('user_username');
        const firstname = req.param('user_firstname');
        const lastname = req.param('user_lastname');
        const email = req.param('user_email');
        const mobileNumber = req.param('user_mobile_number');
        const password = req.param('user_password');
        const userTypeId = req.param('user_user_type_id');
        const managementCompanyId = req.param('management_company_id');

        const result = await UserService.addUser(
            userId,
            username,
            firstname,
            lastname,
            email,
            mobileNumber,
            password,
            userTypeId,
            managementCompanyId,
        );
        if (userTypeId <= 10) {
            const company = await CompanyService.getAccountHolderCompanies(managementCompanyId);
            for (let i in company) {
                await CompanyService.addCompanyToUsers(userId, result.insertId + ",", company[i].id);
            }
        }

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "User Adding Failed.",
                    {
                        data: {
                            msg: "User Adding Failed.",
                        },
                        operation: 'ADD_FAIL',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );


        } else {

            // Send welcome email.
            EmailService.sendWelcomeEmail(
                email,
                username,
                password,
                'Account Holder',
                'welcome',
            );

            res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully added user.",
                    {
                        data: {
                            msg: "Successfully added user.",
                            newId: result.insertId
                        },
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function voidUser(req, res) {

        const result = await UserService.voidUser(
            req.param('user_id'),
            req.param('id'),
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to delete user.",
                    {
                        error: {
                            sql: 'User deletion failed.',
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
                    "Successfully voided user.",
                    {
                        data: {
                            msg: "Successfully voided user.",
                        },
                        operation: 'DELETE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    /**
     * =======================
     * Views
     * =======================
     */

    async function getAccountTypes(req, res) {
        // FUCKING FINE.
        // I WILL ACCEPT DATA IN THE MIDDLEWARE AND RESPOND IT HERE :(
        // IT'S EITHER THE CONTROLLER IS THE FINAL FETCH, OR THE MIDDLEWARE IF EVER THE DATA WOULD INTERSECT
        // JUST LIKE IN THIS CASE WHERE WE FETCH ALL THE ACCOUNT TYPES IN ORDER TO FILTER.
        // SO HERE i'LL FETCH IT AGAIN? WHEN IT ALREADY HAS BEEN.. SO WHY NOT RETURN IT?
        // LOL


        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Here's the account types.",
                {
                    data: req.param('allowedUserTypes'),
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function getManagementCompanies(req, res) {
        const result = await UserService.getManagementCompanies();

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to fetch the management companies.",
                    {
                        error: {
                            sql: 'Failed to fetch the management companies.',
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
                    "Here's the management companies.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    function getUserDetails(req, res) {
        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Here's the user details.",
                {
                    data: req.param('user_details'),
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function updateUser(req, res) {
        const result = await UserService.updateUser(
            req.param('user_edit_id'),
            req.param('user_edit_username'),
            req.param('user_edit_password'),
            req.param('user_edit_firstname'),
            req.param('user_edit_lastname'),
            req.param('user_edit_email'),
            req.param('user_edit_mobile_number'),
            req.param('id'),
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update user.",
                    {
                        error: {
                            sql: 'User update failed.',
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
                    "Successfully Updated The User",
                    {
                        data: {
                            msg: "Successfully Updated The User",
                        },
                        operation: 'UPDATE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }
    async function approveUser(req, res) {
        const result = await UserService.approveUser(
            req.param('user_edit_id'),
            req.param('id'),
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to approve user.",
                    {
                        error: {
                            sql: 'User approve failed.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        } else {
            const userToEdit = await UserService.getUser(req.param('user_edit_id'), '', 'Super Administrator');
            console.log(userToEdit)
            EmailServiceV2.sendManagementCompanyRegistrationEmail(userToEdit[0]['email'], userToEdit[0]['password']);
            res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully Approved The User",
                    {
                        data: {
                            msg: "Successfully Approved The User",
                        },
                        operation: 'APPROVE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }
    async function getUsers(req, res) {
        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Here's the users.",
                {
                    data: req.param('users'),
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function addUserActivity(req, res) {

        const userId = req.param('user_id');
        const userActivityEntityId = req.param('user_activity_entity_id');
        const userActivityCategoryId = req.param('user_activity_category_id');

        const result = await UserService.addUserActivity(userId, userActivityEntityId, userActivityCategoryId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(500,
                    "FAIL",
                    "Failed to Add The Activity Log.",
                    {
                        error: {
                            sql: 'Failed to Add The Activity Log.',
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
                    "Successfully Added The Activity Log",
                    {
                        data: {
                            msg: "Successfully Added The Activity Log",
                        },
                        operation: 'UPDATE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getUserActivityInSameManagementCompany(req, res) {

        const managementCompanyId = req.param('management_company_id');

        const result = await UserService.getUserActivityInSameManagementCompany(managementCompanyId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(500,
                    "FAIL",
                    "Failed to query the user activities.",
                    {
                        error: {
                            sql: 'Failed to query the user activities.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        } else {
            // Email.
            // EmailService.sendItemNotificationEmail('dembygenesis@gmail.com,nikkyeya@gmail.com', [], []);
            EmailService.sendOverdueIncomingAlerts('dembygenesis@gmail.com', [], []);

            res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully queries the user activities.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function updateUserSelf(req, res) {

        const result = await UserService.updateUserSelf(
            req.param('user_firstname'),
            req.param('user_lastname'),
            req.param('user_id'),
            req.param('password'),
        );

        if (result.hasError) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update user.",
                    {
                        error: {
                            sql: 'User update failed.',
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
                "Successfully Updated The User",
                {
                    data: {
                        msg: "Successfully Updated The User",
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function addManagementCompany(req, res) {

        const firstname = req.param('firstname');
        const lastname = req.param('lastname');
        const email = req.param('email');
        const managementCompany = req.param('management_company');

        try {
            const result = await UserService.addManagementCompanyAndAccountHolder(
                firstname,
                lastname,
                email,
                managementCompany
            );

            const approvalEmail = 'linc@compliancelinc.com.au'
            // Call an email service that will send the welcome message!
            EmailServiceV2.sendManagementCompanyApproveEmail(approvalEmail, result['password'], result['user_id']);

            return res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully added the management company.",
                    {
                        data: {
                            msg: "Successfully added the management company.",
                        },
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        } catch (err) {
            console.log(err);
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the Compliance Certifier.",
                    {
                        error: {
                            msg: `Failed to add the user`,
                        },
                        err: err,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function updateLogo(req, res) {
        // Create folder with "management company's" id if not existing
        // If it does exist - remove all files inside of it
        // Add file: "IMAGE_NAME.IMAGE_EXTENSION" into the folder

        const managementCompanyId = req.param('management_company_id');
        const file = req.files;
        const fileReceived = req.files.image.name;


        res.send({
            managementCompanyId: managementCompanyId,
            fileReceived: fileReceived,
        })
    }

    return {
        addManagementCompany: addManagementCompany,
        getUserActivityInSameManagementCompany: getUserActivityInSameManagementCompany,
        addUserActivity: addUserActivity,
        getSampleData: getSampleData,
        getUserDetails: getUserDetails,
        getManagementCompanies: getManagementCompanies,
        getAccountTypes: getAccountTypes,
        getUsers: getUsers,
        addUser: addUser,
        voidUser: voidUser,
        updateUser: updateUser,
        approveUser: approveUser,
        updateUserSelf: updateUserSelf,
        updateLogo: updateLogo,
    }
})();

module.exports = Users;