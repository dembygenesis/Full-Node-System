const express = require('express'),
    _ = require('lodash'),
    BillingService = require('../../services/billing/billing'),
    Utils = require('../../services/utils');

const Middleware = (function () {

    async function getMessageRequiredFields(req, res, next) {
        req.assert('message', 'There must be a message provided.').notEmpty();

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

    return {
        getMessageRequiredFields: getMessageRequiredFields,
    }
})();

module.exports = Middleware;