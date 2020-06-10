var express = require('express'),
    ComplianceService = require('../../services/compliance/compliance'),
    EmailService = require('../../services/email/email'),
    Utils = require('../../services/utils');

const Space = (function () {

    async function addCompliance(req, res) {

        const complianceMeasureIds = req.param('compliance_measure_ids');
        const spaceId = req.param('space_id');
        const userId = req.param('id');

        const result = await ComplianceService.addCompliance(
            complianceMeasureIds,
            spaceId,
            userId,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to add the compliance.",
                    {
                        error: {
                            sql: 'Failed to add the compliance.',
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
                    "Successfully added the compliance.",
                    {
                        data: {
                            msg: "Successfully added the compliance.",
                            newId: result.insertId,
                        },
                        operation: 'ADD_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function updateCompliance(req, res) {

        const complianceId = req.param('compliance_id');
        const complianceMeasureId = req.param('compliance_measure_id');
        const spaceId = req.param('space_id');

        const result = await ComplianceService.updateCompliance(
            complianceId,
            complianceMeasureId,
            spaceId,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the compliance.",
                    {
                        error: {
                            sql: 'Failed to update the compliance.',
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
                    "Successfully updated the compliance.",
                    {
                        data: {
                            msg: "Successfully updated the compliance.",
                            newId: result.insertId,
                        },
                        operation: 'UPDATE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function deleteCompliance(req, res) {

        const complianceId = req.param('compliance_id').split(',');;
        const userId = req.param('id');

        const result = await ComplianceService.deleteCompliance(
            complianceId,
            userId,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to delete the compliance.",
                    {
                        error: {
                            sql: 'Failed to delete the compliance.',
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
                    "Successfully delete the compliance.",
                    {
                        data: {
                            msg: "Successfully delete the compliance.",
                            newId: result.insertId,
                        },
                        operation: 'DELETE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getCompliances(req, res) {

        const userId = req.param('id');

        const result = await ComplianceService.getCompliances(
            userId,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliance.",
                    {
                        error: {
                            sql: 'Failed to query the compliance.',
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
                    "Successfully queried the compliance.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getComplianceById(req, res) {

        const complianceId = req.param('compliance_id');

        const result = await ComplianceService.getComplianceById(
            complianceId,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliance details.",
                    {
                        error: {
                            sql: 'Failed to query the compliance details.',
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
                    "Successfully queried the compliance details.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getComplianceFilters(req, res) {

        const userId = req.param('id');

        const result = await ComplianceService.getComplianceFilters(
            userId,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliance.",
                    {
                        error: {
                            sql: 'Failed to query the compliance.',
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
                    "Successfully queried the compliance.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getComplianceCategories(req, res) {

        const result = await ComplianceService.getComplianceCategories();

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliance categories.",
                    {
                        error: {
                            sql: 'Failed to query the compliance categories.',
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
                    "Successfully queried the compliance categories.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getComplianceMeasures(req, res) {

        const result = await ComplianceService.getComplianceMeasures();

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliance measures.",
                    {
                        error: {
                            sql: 'Failed to query the compliance measures.',
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
                    "Successfully queried the compliance measures.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getComplianceCategoriesAndMeasures(req, res) {
        const result = await ComplianceService.getComplianceCategoriesAndMeasures();

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliance measures.",
                    {
                        error: {
                            sql: 'Failed to query the compliance measures.',
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
                    "Successfully queried the compliance measures.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function hasSpaces(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        let result = await ComplianceService.getSpacesCount(userId, userType);

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

            if (result === 0) {
                res.send(
                    Utils.responseBuilder(
                        500,
                        "FAIL",
                        "Failed to query the spaces count.",
                        {
                            error: {
                                msg: `You cannot create compliances if you don't have spaces.`,
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );

                return;
            }

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

    async function spaceHasCompliance(req, res) {

        const spaceId = req.param('space_id');

        let result = await ComplianceService.spaceHasCompliance(spaceId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliances in space count.",
                    {
                        error: {
                            msg: 'Failed to query the compliances in space count.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

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

    async function getCompliancesFromSpaceId(req, res) {

        const userId = req.param('id');
        const spaceId = req.param('space_id');

        let result = await ComplianceService.getCompliancesFromSpaceId(spaceId, userId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliances in space.",
                    {
                        error: {
                            msg: 'Failed to query the compliances in space.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

        /*if (result.length === 0) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "No compliances found in the space id.",
                    {
                        error: {
                            msg: 'No compliances found in the space id.',
                        },
                        sqlError: result.sql,
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
                "Successfully queried the compliance from the space id.",
                {
                    data: result,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function getNonCheckedMeasuresByComplianceCategory(req, res) {

        const spaceId = req.param('space_id');
        const complianceCategoryId = req.param('compliance_category_id');

        let result = await ComplianceService.getNonCheckedMeasuresByComplianceCategory(complianceCategoryId, spaceId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliances in space.",
                    {
                        error: {
                            msg: 'Failed to query the compliances in space.',
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
                "Successfully queried the compliance measures available under this space id.",
                {
                    data: result,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function getCompaniesWithSpaces(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        let result = await ComplianceService.getCompaniesWithSpaces(userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies..",
                    {
                        error: {
                            msg: 'Failed to query the companies..',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

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

    async function getLocationsWithSpaces(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const companyId = req.param('company_id');

        let result = await ComplianceService.getLocationsWithSpaces(userId, companyId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the locations.",
                    {
                        error: {
                            msg: 'Failed to query the locations.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

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

    async function getLocationsFromLocationTypeWithSpaces(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const locationTypeId = req.param('location_type_id');
        const companyId = req.param('company_id');

        let result = await ComplianceService.getLocationsFromLocationTypeWithSpaces(userId, companyId, locationTypeId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the locations.",
                    {
                        error: {
                            msg: 'Failed to query the locations.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

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

    async function getLocationTypesWithCompanies(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const companyId = req.param('company_id');

        let result = await ComplianceService.getLocationTypesWithCompanies(userId, companyId, userType);

        if (result.hasError) {

            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the location types.",
                    {
                        error: {
                            msg: 'Failed to query the location types.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

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

    async function getSpacesByLocation(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const locationId = req.param('location_id');

        let result = await ComplianceService.getSpacesByLocation(userId, locationId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies..",
                    {
                        error: {
                            msg: 'Failed to query the companies..',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

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

    async function getAttachableComplianceCategories(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const locationId = req.param('location_id');

        let result = await ComplianceService.getAttachableComplianceCategories(userId, locationId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies..",
                    {
                        error: {
                            msg: 'Failed to query the companies..',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );

            return;
        }

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

    async function updateComplianceContributor(req, res) {

        const complianceId = req.param('compliance_id').split(',');;
        const email = req.param('email');
        const userId = req.param('id');

        let result = await ComplianceService.updateComplianceContributor(complianceId, email, userId);

        if (result.hasError) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the Compliance Certifier.",
                    {
                        error: {
                            msg: `Failed to update the Compliance Certifier. Error ${JSON.stringify(result.sql)}`,
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        // Trigger sent here.
        EmailService.sendWelcomeEmail(
            email,
            email,
            email,
            'Compliance Certifier',
            'welcome',
        );

        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Successfully updated the Compliance Certifier.",
                {
                    data: {
                        msg: "Successfully updated the Compliance Certifier.",
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    return {
        updateComplianceContributor: updateComplianceContributor,
        getCompaniesWithSpaces: getCompaniesWithSpaces,
        getLocationsWithSpaces: getLocationsWithSpaces,
        getLocationsFromLocationTypeWithSpaces: getLocationsFromLocationTypeWithSpaces,
        getLocationTypesWithCompanies: getLocationTypesWithCompanies,
        getAttachableComplianceCategories: getAttachableComplianceCategories,
        getSpacesByLocation: getSpacesByLocation,
        getNonCheckedMeasuresByComplianceCategory: getNonCheckedMeasuresByComplianceCategory,
        getCompliancesFromSpaceId: getCompliancesFromSpaceId,
        spaceHasCompliance: spaceHasCompliance,
        hasSpaces: hasSpaces,
        getComplianceCategoriesAndMeasures: getComplianceCategoriesAndMeasures,
        getComplianceFilters: getComplianceFilters,
        addCompliance: addCompliance,
        updateCompliance: updateCompliance,
        deleteCompliance: deleteCompliance,
        getCompliances: getCompliances,
        getComplianceById: getComplianceById,
        getComplianceCategories: getComplianceCategories,
        getComplianceMeasures: getComplianceMeasures,
    }
})();

module.exports = Space;