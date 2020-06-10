var express = require('express'),
    SpaceService = require('../../services/space/space'),
    Utils = require('../../services/utils');

const Space = (function () {

    async function addSpace(req, res) {

        const locationId = req.param('location_id');
        const name = req.param('name');
        const description = req.param('description');
        const userId = req.param('id');

        const result = await SpaceService.addSpace(
            locationId,
            name,
            description,
            userId
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to add the space.",
                    {
                        error: {
                            sql: 'Failed to add the space.',
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
                    "Successfully added the space.",
                    {
                        data: {
                            msg: "Successfully added the space.",
                            newId: result.insertId,
                        },
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function updateSpace(req, res) {

        const spaceId = req.param('space_id');
        const locationId = req.param('location_id');
        const name = req.param('name');
        const description = req.param('description');

        const result = await SpaceService.updateSpace(
            spaceId,
            locationId,
            name,
            description
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the space.",
                    {
                        error: {
                            sql: 'Failed to update the space.',
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
                    "Successfully updated the space.",
                    {
                        data: {
                            msg: "Successfully updated the space.",
                            newId: result.insertId,
                        },
                        operation: 'UPDATE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function deleteSpace(req, res) {

        const spaceId = req.param('space_id');
        const userId = req.param('id');

        const result = await SpaceService.deleteSpace(
            spaceId,
            userId,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to delete the space.",
                    {
                        error: {
                            sql: 'Failed to delete the space.',
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
                    "Successfully deleted the space.",
                    {
                        data: {
                            msg: "Successfully deleted the space.",
                            newId: result.insertId,
                        },
                        operation: 'DELETE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getSpaces(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        const result = await SpaceService.getSpaces(userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the spaces.",
                    {
                        error: {
                            sql: 'Failed to query the spaces.',
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
                    "Successfully queries the spaces.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getSpaceById(req, res) {

        const spaceId = req.param('space_id');

        const result = await SpaceService.getSpaceById(
            spaceId,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the space.",
                    {
                        error: {
                            sql: 'Failed to query the space.',
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
                    "Successfully queries the space.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getLocationFilters(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        const result = await SpaceService.getLocationFilters(
            userId,
            userType,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the space.",
                    {
                        error: {
                            sql: 'Failed to query the space.',
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
                    "Successfully queries the space.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function userHasLocations(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const managementCompanyId = req.param('management_company_id');

        const result = await SpaceService.userHasLocations(
            userId,
            userType,
            managementCompanyId,
        );
        
        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the space.",
                    {
                        error: {
                            sql: 'Failed to query the space.',
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
                    "Successfully queries the space.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getSpacesByLocationId(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const locationId = req.param('location_id');

        const result = await SpaceService.getSpacesByLocationId(userId, locationId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the space by location id.",
                    {
                        error: {
                            sql: 'Failed to query the space by location id.',
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
                    "Successfully queries the space by location id.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }


    async function hasSpaces (req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        let result = await SpaceService.getSpacesCount(userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the spaces count.",
                    {
                        error: {
                            sql: 'Failed to query the spaces count.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        } else {
            // If 0 throw error.
            result = parseFloat(result[0]['space_count']);

            /*if (result === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Failed to query the spaces count.",
                        {
                            error: {
                                msg: `You don't have spaces currently created.`,
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }*/

            res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully queried the spaces count.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    return {
        hasSpaces: hasSpaces,
        getSpacesByLocationId: getSpacesByLocationId,
        userHasLocations: userHasLocations,
        getLocationFilters: getLocationFilters,
        addSpace: addSpace,
        updateSpace: updateSpace,
        deleteSpace: deleteSpace,
        getSpaces: getSpaces,
        getSpaceById: getSpaceById,
    }
})();

module.exports = Space;