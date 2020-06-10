var express = require('express'),
    ManagementCompanyService = require('../../services/managementCompany/managementCompany'),
    Utils = require('../../services/utils'),
    BillingService = require('../../services/billing/billing');

const Users = (function () {

    async function updateLogo(req, res) {

        const managementCompanyId = req.param('management_company_id');

        const file = req.files;

        const query = await ManagementCompanyService.updateData(managementCompanyId, file);

        if (!query) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the name and/or logo.",
                    {
                        error: {
                            sql: 'Something went wrong when trying to update the management company logo.',
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
                "",
                {
                    data: {
                        msg: "Successfully updated the management company."
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function getLogo(req, res) {

        const managementCompanyId = req.param('management_company_id');

        const result = await ManagementCompanyService.getLogo(managementCompanyId);

        if (result.length > 0) {
            res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully queried the logo.",
                    {
                        data: result[0]['logo'],
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        } else {
            res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully queried the logo.",
                    {
                        data: '',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function updateName(req, res) {
        const name = req.param('name');

        const managementCompanyId = req.param('management_company_id');
        const result = await ManagementCompanyService.updateName(managementCompanyId, name);

        if (result.hasError) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the management company name.",
                    {
                        error: {
                            sql: 'Failed to update the management company name.',
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
                "Successfully updated the management company name.",
                {
                    data: {
                        msg: "Successfully updated the management company name."
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function updateSiteWideMessage(req, res) {
        const siteWideMessage = req.param('site_wide_message');

        const managementCompanyId = req.param('management_company_id');
        const result = await ManagementCompanyService.updateSiteWideMessage(managementCompanyId, siteWideMessage);

        if (result.hasError) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the management company site wide message.",
                    {
                        error: {
                            sql: 'Failed to update the management company site wide message.',
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
                "Successfully updated the management company site wide message.",
                {
                    data: {
                        msg: "Successfully updated the management company site wide message.",
                        newId: result.insertId,
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }


    async function getManagementCompanyDetails(req, res) {

        const managementCompanyId = req.param('management_company_id');
        const result = await ManagementCompanyService.getManagementCompanyDetails(managementCompanyId);
        const prices = await BillingService.getPricing();
        const rate = await BillingService.getRate(managementCompanyId, prices);

        const billing = await BillingService.getTotalNumberOfSpacePerLocation(managementCompanyId);
        result[0].billing = billing
        result[0].prices = prices
        result[0].rate = rate

        if (result.hasError) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the management company.",
                    {
                        error: {
                            sql: 'Failed to query the management company.',
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
                "Successfully queried the management company.",
                {
                    data: result[0],
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    return {
        updateLogo: updateLogo,
        updateName: updateName,
        updateSiteWideMessage: updateSiteWideMessage,
        getLogo: getLogo,
        getManagementCompanyDetails: getManagementCompanyDetails,
    }
})();

module.exports = Users;