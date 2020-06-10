var express = require('express'),
    LocationService = require('../../services/location/location'),
    Utils = require('../../services/utils');

const Users = (function () {

    async function updateLocation(req, res) {

        const locationId = req.param('location_id');
        const name = req.param('name');
        const streetName = req.param('street_name');
        const streetNumber = req.param('street_number');
        const suburb = req.param('suburb');
        const postalCode = req.param('postal_code');
        const companyId = req.param('company_id');
        const locationTypeId = req.param('location_type_id');
        const state = req.param('state');
        const userId = req.param('id');

        const result = await LocationService.updateLocationById(
            locationId,
            name,
            streetName,
            streetNumber,
            suburb,
            postalCode,
            companyId,
            userId,
            locationTypeId,
            state,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the location.",
                    {
                        error: {
                            sql: 'Failed to update the location.',
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
                    "Successfully Updated the location.",
                    {
                        data: {
                            msg: "Successfully Updated the location.",
                        },
                        operation: 'UPDATE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function addLocation(req, res) {

        const name = req.param('name');
        const streetName = req.param('street_name');
        const streetNumber = req.param('street_number');
        const suburb = req.param('suburb');
        const postalCode = req.param('postal_code');
        const companyId = req.param('company_id');
        const locationTypeId = req.param('location_type_id');
        const state = req.param('state');
        const userId = req.param('id');

        const result = await LocationService.addLocation(
            name,
            streetName,
            streetNumber,
            suburb,
            postalCode,
            companyId,
            userId,
            locationTypeId,
            state,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to add the location.",
                    {
                        error: {
                            sql: 'Failed to add the location.',
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
                    "Successfully added the location.",
                    {
                        data: {
                            msg: "Successfully added the location.",
                            newId: result.insertId,
                        },
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function deleteLocation(req, res) {

        const userId = req.param('id');
        const locationId = req.param('location_id');

        const result = await LocationService.deleteLocationById(
            locationId,
            userId,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to delete the location.",
                    {
                        error: {
                            sql: 'Failed to delete the location.',
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
                    "Successfully deleted the location.",
                    {
                        data: {
                            msg: "Successfully deleted the location.",
                        },
                        operation: 'DELETE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function voidLocation(req, res) {

        const userId = req.param('id');
        const locationId = req.param('location_id');

        const result = await LocationService.voidLocationById(
            locationId,
            userId
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to delete the location.",
                    {
                        error: {
                            sql: 'Failed to delete the location.',
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
                    "Successfully deleted the location.",
                    {
                        data: {
                            msg: "Successfully deleted the location.",
                        },
                        operation: 'DELETE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getLocations(req, res) {

        const userId = req.param('id');

        const result = await LocationService.getLocationsByUserId(userId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to queried the locations.",
                    {
                        error: {
                            sql: 'Failed to queried the locations.',
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
                    "Successfully queried the locations.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getLocationsByManagementId(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const managementCompanyId = req.param('management_company_id');

        const result = await LocationService.getLocationsByManagementId(managementCompanyId, userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to queried the locations.",
                    {
                        error: {
                            sql: 'Failed to queried the locations.',
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
                    "Successfully queried the locations.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getLocationById(req, res) {

        const locationData = req.param('location_data');

        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Successfully queried the location by ID.",
                {
                    data: locationData,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function getLocationsByCompany(req, res) {

        const managementCompanyId = req.param('management_company_id');
        const userId = req.param('id');
        const userType = req.param('user_type');
        const companyId = req.param('company_id');

        const result = await LocationService.getLocationsByUserIdAndCompanyId(managementCompanyId, companyId, userType, userId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to queried the locations.",
                    {
                        error: {
                            sql: 'Failed to queried the locations.',
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
                    "Successfully queried the locations.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getCompanyFilters(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        const result = await LocationService.getLocationCompaniesByUserId(userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to queried the locations.",
                    {
                        error: {
                            sql: 'Failed to queried the locations.',
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
                    "Successfully queried the locations.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getLocationTypes(req, res) {

        const result = await LocationService.getLocationTypes();

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to queried the location types.",
                    {
                        error: {
                            sql: 'Failed to queried the location types.',
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
                    "Successfully queried the location types.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getStates(req, res) {

        const result = await LocationService.getStates();

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the states.",
                    {
                        error: {
                            sql: 'Failed to query the states.',
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
                    "Successfully queried the states.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getPostCodesByState(req, res) {

        const state = req.param('state');

        const result = await LocationService.getPostCodesByState(state);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the states.",
                    {
                        error: {
                            sql: 'Failed to query the states.',
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
                    "Successfully queried the states.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function userHasCompanies(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        const result = await LocationService.userHasCompanies(userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the number of companies the user has access to.",
                    {
                        error: {
                            sql: 'Failed to query the number of companies the user has access to.',
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
                    "Successfully queried the companies the user has access to.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function userHasCompaniesWithLocations(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        const result = await LocationService.userHasCompaniesWithLocations(userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the number of companies the user has access to.",
                    {
                        error: {
                            sql: 'Failed to query the number of companies the user has access to.',
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
                    "Successfully queried the companies the user has access to.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getAssignableManagersByManagementId(req, res) {

        const managementCompanyId = req.param('management_company_id');
        const locationId = req.param('location_id');

        const result = await LocationService.getAssignableManagersByManagementId(managementCompanyId, locationId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the number of companies the user has access to.",
                    {
                        error: {
                            sql: 'Failed to query the number of companies the user has access to.',
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
                    "Successfully queried the companies the user has access to.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function assignLocationToManager(req, res) {

        const userIds = req.param('user_ids');
        const userId = req.param('id');
        const locationId = req.param('location_id');

        const result = await LocationService.assignLocationToManager(userIds, userId, locationId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the number of companies the user has access to.",
                    {
                        error: {
                            sql: 'Failed to query the number of companies the user has access to.',
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
                    "Successfully queried the companies the user has access to.",
                    {
                        data: {
                            msg: "Successfully assigned user to the location."
                        },
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function removeLocationFromManager(req, res) {

        const userIds = req.param('user_ids');
        const userId = req.param('id');
        const locationId = req.param('location_id');

        const result = await LocationService.removeLocationFromManager(userIds, userId, locationId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the number of companies the user has access to.",
                    {
                        error: {
                            sql: 'Failed to query the number of companies the user has access to.',
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
                    "Successfully queried the companies the user has access to.",
                    {
                        data: {
                            msg: "Successfully removed user from the location."
                        },
                        operation: 'UPDATE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    return {
        addLocation: addLocation,
        assignLocationToManager: assignLocationToManager,
        removeLocationFromManager: removeLocationFromManager,
        userHasCompanies: userHasCompanies,
        userHasCompaniesWithLocations: userHasCompaniesWithLocations,
        getPostCodesByState: getPostCodesByState,
        getStates: getStates,
        updateLocation: updateLocation,
        deleteLocation: deleteLocation,
        voidLocation: voidLocation,
        getLocations: getLocations,
        getAssignableManagersByManagementId: getAssignableManagersByManagementId,
        getLocationsByManagementId: getLocationsByManagementId,
        getLocationById: getLocationById,
        getLocationsByCompany: getLocationsByCompany,
        getCompanyFilters: getCompanyFilters,
        getLocationTypes: getLocationTypes,
    }
})();

module.exports = Users;