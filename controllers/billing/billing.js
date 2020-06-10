var express = require('express'),
    BillingService = require('../../services/billing/billing'),
    Utils = require('../../services/utils');

const Space = (function () {

    async function getBillingMessage(req, res) {

        const message = req.param('message');

        const result = await BillingService.getBillingMessage(message);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to get the message.",
                    {
                        error: {
                            sql: 'Failed to get the message.',
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
                    "Successfully added the message.",
                    {
                        data: result,
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    return {
        getBillingMessage: getBillingMessage,
    }
})();

module.exports = Space;