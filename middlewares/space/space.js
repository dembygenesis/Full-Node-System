const express = require('express'),
    _ = require('lodash'),
    db = require('../../services/database/database'),
    SpaceService = require('../../services/space/space'),
    Utils = require('../../services/utils');

const Middlewares = (function () {

    async function checkSpaceRequiredFields(req, res, next) {
        req.assert('location_id', 'The space id field must not be empty and must be valid.')
            .notEmpty()
            .hasEntries('`location`', 'id', 1);

        req.assert('name', 'The name field must not be empty.').notEmpty();
        req.assert('description', 'The description field must not be empty.').notEmpty();

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

    async function checkSpaceAccess(req, res, next) {
        req.assert('space_id', 'The space id field must not be empty and must be valid.')
            .notEmpty()
            .hasEntries('`space`', 'id', 1);

        try {
            await req.asyncValidationErrors();

            const spaceId = req.param('space_id');
            const userId = req.param('id');
            const userType = req.param('user_type');

            // Check if you own the space via location and company.
            let checkAccess = await SpaceService.getSpaceAccessPrivilege(spaceId, userId, userType);

            if (checkAccess.hasError) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "User Adding Failed.",
                        {
                            data: {
                                msg: "Something went wrong when trying to check the space access.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            checkAccess = parseFloat(checkAccess[0]['space_access']);

            if (checkAccess === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "User Adding Failed.",
                        {
                            data: {
                                msg: "You have no access privileges in this space.",
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

            next();
        } catch (errors) {
            // Send here.
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function checkSpaceAccessIfProvided(req, res, next) {
        req.assert('space_id', 'The space id field must not be empty and must be valid.')
            .hasEntriesOrEmpty('`space`', 'id');

        try {
            await req.asyncValidationErrors();

            if (typeof req.param('space_id') !== "undefined") {
                const spaceId = req.param('space_id');
                const userId = req.param('id');
                const userType = req.param('user_type');

                // Check if you own the space via location and company.
                let checkAccess = await SpaceService.getSpaceAccessPrivilege(spaceId, userId, userType);

                if (checkAccess.hasError) {
                    res.send(
                        Utils.responseBuilder(
                            500,
                            "FAIL",
                            "User Adding Failed.",
                            {
                                data: {
                                    msg: "Something went wrong when trying to check the space access.",
                                },
                                payload: Utils.extractRequestParams(req)
                            }
                        )
                    );

                    return;
                }

                checkAccess = parseFloat(checkAccess[0]['space_access']);

                if (checkAccess === 0) {
                    res.send(
                        Utils.responseBuilder(
                            500,
                            "FAIL",
                            "User Adding Failed.",
                            {
                                data: {
                                    msg: "You have no access privileges in this space.",
                                },
                                payload: Utils.extractRequestParams(req)
                            }
                        )
                    );

                    return;
                }
            }



            next();
        } catch (errors) {
            // Send here.
            res.send(Utils.responseBuilder(200, "FAILED_VALIDATION", "Failed validation.", {
                error: Utils.extractErrorMessages(errors),
                payload: Utils.extractRequestParams(req)
            }));
        }
    }

    async function hasNoDependencies(req, res, next) {

        try {

            let dependencies = await SpaceService.getDependencies( req.param('space_id') );

            if (dependencies.length > 0 ) {

                dependencies = JSON.stringify( dependencies.map(dependency => dependency.name) );

                return res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Space dependency check failed.",
                        {
                            error: {
                                msg: `This space has compliances which are dependent on it: ${dependencies}. Please remove them first.`,
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            }

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
        hasNoDependencies: hasNoDependencies,
        checkSpaceRequiredFields: checkSpaceRequiredFields,
        checkSpaceAccess: checkSpaceAccess,
        checkSpaceAccessIfProvided: checkSpaceAccessIfProvided,
    }
})();

module.exports = Middlewares;