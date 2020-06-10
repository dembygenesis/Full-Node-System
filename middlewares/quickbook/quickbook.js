const express = require('express'),
    _ = require('lodash'),
    Utils = require('../../services/utils');

const Middlewares = (function () {

    function authRequiredFields(req, res, next) {
        req.assert('management_company_id', 'must not be empty').notEmpty();

        req.asyncValidationErrors().then(function () {
            next();
        }).catch(function (errors) {
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        });
    }


    return {
        authRequiredFields: authRequiredFields,
    }
})();

module.exports = Middlewares;