const express = require('express'),
    _ = require('lodash'),
    MeasureService = require('../../services/measure/measure'),
    db = require('../../services/database/database'),
    Utils = require('../../services/utils');

const Middlewares = (function () {

    async function checkLogo(req, res, next) {

        // Ensure there is a file.
        if (req.files === null) {

            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to fetch the management companies.",
                    {
                        error: {
                            msg: 'No file attached.',
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        // Ensure it is an image.
        const fileType = req.files['image']['mimetype'].split('/')[0];

        if (fileType !== 'image') {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to fetch the management companies.",
                    {
                        error: {
                            msg: 'Unsupported file type: ' + fileType,
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        // Ensure up to 20MB only.
        const fileSizeInKiloBytes = (parseFloat(req.files['image']['size'])) / 1000; // let's say this is 1000 kilobytes
        const fileSizeInMegaBytes = fileSizeInKiloBytes / 1000;

        if (fileSizeInMegaBytes > 20) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to fetch the management companies.",
                    {
                        error: {
                            msg: 'You are only allowed a maximum file size of 20mb.',
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        next();
    }

    async function checkName(req, res, next) {
        req.assert('name', 'The name field must not be empty.').notEmpty();

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

    async function checkSiteWideMessage(req, res, next) {
        req.assert('site_wide_message', 'The name field must not be empty.').notEmpty();

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

    return {
        checkLogo: checkLogo,
        checkName: checkName,
        checkSiteWideMessage: checkSiteWideMessage,
    }
})();

module.exports = Middlewares;