var express = require('express'),
    CompanyService = require('../../services/companies/companies'),
    Utils = require('../../services/utils');

const Companies = (function () {

    async function addCompany(req, res) {

        /**
         * billing_street_number
           billing_street_name
           billing_suburb
           billing_post_code
         * @type {*|*}
         */


        const result = await CompanyService.addCompany(
            req.param('name'),
            req.param('acn_vcn'),
            req.param('mobile_number'),
            req.param('telephone_number'),
            req.param('id'),

            // Business billing.
            req.param('billing_street_number'),
            req.param('billing_street_name'),
            req.param('billing_suburb'),
            req.param('billing_post_code'),

            req.param('address'),
            req.param('postal_code'),


            req.param('contact_name'),
            req.param('email'),
            req.param('purchase_order_number'),
        );

        await CompanyService.addCustomer(result.insertId)
        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to add the company.",
                    {
                        error: {
                            msg: 'Failed to add the company.',
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
                    "Successfully added company.",
                    {
                        data: {
                            msg: "Successfully added company.",
                            newId: result.insertId
                        },
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function saveCreditCard(req, res){

        const result = await CompanyService.saveCreditCard(
            req.param('company_id'),
            req.param('card_code'),
            req.param('card_number'),
            req.param('selected_month'),
            req.param('selected_year'),
            req.param('billing_street_number'),
            req.param('billing_street_name'),
            req.param('billing_suburb'),
            req.param('billing_post_code'),
            req.param('contact_name'),
        );
        const updateCreditCard = await CompanyService.updateCompanyCreditCardToken(
            req.param('company_id'),
            result.value,
            req.param('selected_month'),
            req.param('selected_year'),
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the company.",
                    {
                        error: {
                            sql: "Failed to update the company.",
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
                    "Successfully Updated The Company.",
                    {
                        data: {
                            msg: "Successfully Updated The Company.",
                        },
                        operation: 'UPDATE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }
    async function updateCompany(req, res) {

        const result = await CompanyService.updateCompany(
            req.param('company_id'),
            req.param('name'),
            req.param('acn_vcn'),
            req.param('mobile_number'),
            req.param('telephone_number'),

            // Business billing.
            req.param('billing_street_number'),
            req.param('billing_street_name'),
            req.param('billing_suburb'),
            req.param('billing_post_code'),

            req.param('contact_name'),
            req.param('email'),
            req.param('purchase_order_number'),

            req.param('id'),
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the company.",
                    {
                        error: {
                            sql: "Failed to update the company.",
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
                    "Successfully Updated The Company.",
                    {
                        data: {
                            msg: "Successfully Updated The Company.",
                        },
                        operation: 'UPDATE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function voidCompany(req, res) {

        const result = await CompanyService.voidCompanyById(
            req.param('company_id'),
            req.param('id'),
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to void the company.",
                    {
                        error: {
                            sql: "Failed to void the company.",
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
                    "Successfully Deleted the company.",
                    {
                        data: {
                            msg: "Successfully Deleted the company.",
                        },
                        operation: 'DELETE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getCompanyByCreator(req, res) {

        const result = await CompanyService.getCompanyByCreator(
            req.param('id'),
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to get the companies.",
                    {
                        error: {
                            sql: "Failed to get the companies.",
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
                    "Successfully queried the companies.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function assignCompanyToUsers(req, res) {
        const clientId = req.param('id');
        const userIds = req.param('user_ids');
        const companyId = req.param('company_id');


        /*const result = CompanyService.addCompanyToUsers(clientId, userIds, companyId);

        res.send(result);*/

        // Need service to build insert string.

        // ==================================

        const result = await CompanyService.addCompanyToUsers(clientId, userIds, companyId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to attach the company to users.",
                    {
                        error: {
                            sql: "Failed to attach the company to users.",
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
                    "Successfully attached the companies to the user.",
                    {
                        data: {
                            msg: "Successfully attached the companies to the user.",
                        },
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

    }

    async function assignCompanyToReviewers(req, res) {
        const clientId = req.param('id');
        const userIds = req.param('user_ids');
        const companyId = req.param('company_id');

        console.log('HAHA');
        
        const result = await CompanyService.addCompanyToReviewers(clientId, userIds, companyId);

        if (result.hasError) {

            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to attach the company to users.",
                    {
                        error: {
                            sql: "Failed to attach the company to users.",
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
                    "Successfully attached the companies to the reviewer.",
                    {
                        data: {
                            msg: "Successfully attached the companies to the reviewer.",
                        },
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

    }

    async function revokeCompanyFromUsers(req, res) {
        const clientId = req.param('id');
        const userIds = req.param('user_ids');
        const companyId = req.param('company_id');

        const result = await CompanyService.revokeCompanyFromUsers(clientId, userIds, companyId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to remove the company from users.",
                    {
                        error: {
                            sql: "Failed to remove the company from users.",
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
                    "Successfully revoked the companies from the user(s).",
                    {
                        data: {
                            msg: "Successfully revoked the companies from the user(s).",
                        },
                        operation: 'DELETE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

    }

    async function revokeCompanyFromReviewers(req, res) {
        const clientId = req.param('id');
        const userIds = req.param('user_ids');
        const companyId = req.param('company_id');

        const result = await CompanyService.revokeCompanyFromReviewers(clientId, userIds, companyId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to remove the company from users.",
                    {
                        error: {
                            sql: "Failed to remove the company from users.",
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
                    "Successfully revoked the companies from the reviewer(s).",
                    {
                        data: {
                            msg: "Successfully revoked the companies from the reviewer(s).",
                        },
                        operation: 'DELETE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

    }

    async function getCreatedAndPrivilegedCompanies(req, res) {

        const userId = req.param('id');

        const result = await CompanyService.getCreatedAndPrivilegedCompanies(userId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies.",
                    {
                        error: {
                            sql: "Failed to query the companies.",
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
                    "Successfully queried the companies.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getCreatedAndPrivilegedCompaniesByCompanyId(req, res) {

        const companyId = req.param('company_id');
        const managementCompanyId = req.param('management_company_id');

        const result = await CompanyService.getCreatedAndPrivilegedCompaniesByCompanyId(managementCompanyId, companyId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies.",
                    {
                        error: {
                            sql: "Failed to query the companies.",
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
                    "Successfully queried the companies.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getReviewerCreatedAndPrivilegedCompaniesByCompanyId(req, res) {

        const companyId = req.param('company_id');
        const managementCompanyId = req.param('management_company_id');

        const result = await CompanyService.getReviewerCreatedAndPrivilegedCompaniesByCompanyId(managementCompanyId, companyId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies.",
                    {
                        error: {
                            sql: "Failed to query the companies.",
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
                    "Successfully queried the companies.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getCompanyById(req, res) {
        const companyId = req.param('company_id');

        const result = await CompanyService.getCompanyById(companyId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the company.",
                    {
                        error: {
                            sql: "Failed to query the company.",
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
                    "Successfully queried the company.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getAccountHolderCompanies(req, res) {

        const managementCompanyId = req.param('management_company_id');

        const result = await CompanyService.getAccountHolderCompanies(managementCompanyId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the company.",
                    {
                        error: {
                            sql: "Failed to query the company.",
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
                    "Successfully queried the company.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    return {
        getCreatedAndPrivilegedCompaniesByCompanyId: getCreatedAndPrivilegedCompaniesByCompanyId,
        getReviewerCreatedAndPrivilegedCompaniesByCompanyId: getReviewerCreatedAndPrivilegedCompaniesByCompanyId,
        getCreatedAndPrivilegedCompanies: getCreatedAndPrivilegedCompanies,
        getAccountHolderCompanies: getAccountHolderCompanies,
        revokeCompanyFromUsers: revokeCompanyFromUsers,
        revokeCompanyFromReviewers: revokeCompanyFromReviewers,
        assignCompanyToUsers: assignCompanyToUsers,
        assignCompanyToReviewers: assignCompanyToReviewers,
        getCompanyByCreator: getCompanyByCreator,
        addCompany: addCompany,
        voidCompany: voidCompany,
        updateCompany: updateCompany,
        getCompanyById: getCompanyById,
        saveCreditCard: saveCreditCard
    }
})();

module.exports = Companies;