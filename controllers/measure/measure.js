var express = require('express'),
    MeasureService = require('../../services/measure/measure'),
    EmailService = require('../../services/email/email'),
    fs = require('fs'),
    path = require('path');
    Utils = require('../../services/utils');

const Measures = (function () {

    async function getFilters(req, res) {

        const userId = req.param('id');
        const result = await MeasureService.getFilters(userId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the filters.",
                    {
                        error: {
                            sql: 'Failed to query the filters.',
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
                    "Successfully queried the filters.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getCompaniesWithAccess(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const result = await MeasureService.getCompaniesWithAccess(userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies.",
                    {
                        error: {
                            sql: 'Failed to query the companies.',
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

    async function getLocationsWithAccess(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const companyId = req.param('company_id');
        const result = await MeasureService.getLocationsWithAccess(companyId, userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the locations.",
                    {
                        error: {
                            sql: 'Failed to query the locations.',
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

    async function getSpacesWithAccess(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const locationId = req.param('location_id');
        const result = await MeasureService.getSpacesWithAccess(locationId, userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies.",
                    {
                        error: {
                            sql: 'Failed to query the companies.',
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

    async function getComplianceCategoriesWithAccess(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');
        const spaceId = req.param('space_id');
        const result = await MeasureService.getComplianceCategoriesWithAccess(spaceId, userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies.",
                    {
                        error: {
                            sql: 'Failed to query the companies.',
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

    async function userHasCompliances(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        const result = await MeasureService.userHasCompliances(userId, userType);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the companies.",
                    {
                        error: {
                            sql: 'Failed to query the companies.',
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

    async function getComplianceMeasures(req, res) {

        const userId = req.param('id');
        const userType = req.param('user_type');

        const companyId = req.param('company_id');
        const locationId = req.param('location_id');
        const spaceId = req.param('space_id');
        const complianceCategoryId = req.param('compliance_category_id');

        const result = await MeasureService.getComplianceMeasures(
            userId,
            companyId,
            locationId,
            spaceId,
            complianceCategoryId,
            userType,
        );

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

    async function getHistoryByComplianceId(req, res) {

        const complianceId = req.param('compliance_id');

        const result = await MeasureService.getHistoryByComplianceId(complianceId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliance measure history.",
                    {
                        error: {
                            sql: 'Failed to query the compliance measure history.',
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
                    "Successfully queried the compliance measure history.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getComplianceMeasureById(req, res) {

        const userId = req.param('id');
        const complianceId = req.param('compliance_id');

        const result = await MeasureService.getComplianceMeasureById(complianceId, userId);

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

            return;
        }

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

    /*async function updateComplianceDueDate(req, res) {

        console.log('Chester catherine');
        console.log('userId: ' + req.param('id'));

        const complianceId = req.param('compliance_id');

        const complianceDetails = (await MeasureService.getComplianceMeasureById(complianceId, userId));

        res.send('hello');
    }*/

    async function updateComplianceDueDate(req, res) {

        const complianceId = req.param('compliance_id');
        const userId = req.param('id');

        const complianceDetails = (await MeasureService.getComplianceMeasureById(complianceId, userId))[0];

        const complianceDue = complianceDetails['due'];
        const newDueDate = req.param('due_date');
        const latestStatus = complianceDetails['latest_compliance_status'];
        const historyMsg = `Due Date, from "${complianceDue}" to "${newDueDate}".`;

        const result = await MeasureService.updateComplianceDueDate(complianceId, newDueDate, historyMsg, userId, latestStatus);

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

            return;
        }

        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Successfully queried the compliance measures.",
                {
                    data: {
                        msg: "Successfully updated the due date.",
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function updateComplianceAddResult2(req, res) {
        let userId            = req.param('id');
        let complianceId      = req.param('compliance_id');
        let resultType        = req.param('result_type');
        let actionRating      = req.param('action_rating');

        let resultDate        = req.param('result_date');
        let comments          = typeof req.param('comments') !== "undefined" ? req.param('comments') : '';

        let resultsDetail     = typeof req.param('resultsDetail') !== "undefined" ? req.param('resultsDetail') : '';

        let adviseManager     = parseFloat( req.param('advise_manager') );
        let adviseAdministrator   = parseFloat( req.param('advise_administrator') );

        if (actionRating === 'Critical Defect') {
            adviseManager = 1;
            adviseAdministrator = 1;
        }
        
        try {
            const result = await MeasureService.updateComplianceAddResult3(
                resultType,
                complianceId,
                resultDate,
                userId,
                comments,
                actionRating,
                adviseManager,
                adviseAdministrator,
                resultsDetail,
            );

            let actionsInitiated = [];

            if (adviseManager === 1) {
                actionsInitiated.push('Advise Manager');
            }
            if (adviseAdministrator === 1) {
                actionsInitiated.push('Advise Administrator');
            }

            MeasureService.sendNotificationEmails(complianceId, actionsInitiated, actionRating);

            return res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully added the result.",
                    {
                        data: {
                            msg: "Successfully added the result.",
                        },
                        operation: 'UPDATE_SUCCESS',
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        } catch (err) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to add the result.",
                    {
                        error: {
                            sql: 'Failed to add the result: ' + err.sql,
                        },
                        sqlError: err.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function updateComplianceAddResult(req, res) {

        let userId            = req.param('id');
        let complianceId      = req.param('compliance_id');
        let resultType        = req.param('result_type');
        let actionRating      = req.param('action_rating');

        let resultDate        = req.param('result_date');
        let comments          = typeof req.param('comments') !== "undefined" ? req.param('comments') : '';

        let resultsDetail     = typeof req.param('resultsDetail') !== "undefined" ? req.param('resultsDetail') : '';

        let adviseManager     = parseFloat( req.param('advise_manager') );
        let adviseAdministrator   = parseFloat( req.param('advise_administrator') );

        let complianceDetails = (await MeasureService.getComplianceMeasureRawById(complianceId))[0];
        let currentStatus     = MeasureService.determineStatusType( complianceDetails['latest_status'] );
        let currentDefectType = complianceDetails['latest_action_rating'] === null ? '' : complianceDetails['latest_action_rating'];

        let historyMessage    = `Status, from "${currentStatus}" to "${resultType}". `;
            historyMessage   += `Defect Type, from "${currentDefectType}" to "${actionRating}".`;

        // Override.
        if (actionRating === 'Critical Defect') {
            adviseManager = 1;
            adviseAdministrator = 1;
        }

        let actionsInitiated = [];

        // Include actions initiated in history if there are.
        if (adviseManager || adviseAdministrator) {
            if (adviseManager) {
                actionsInitiated.push('Advise Manager');
            }

            if (adviseAdministrator) {
                actionsInitiated.push('Advise Administrator');
            }

            actionsInitiated = JSON.stringify(actionsInitiated);
        }

        if (actionsInitiated.length > 0) {
            historyMessage = historyMessage + ' Action(s) Initiated: ' + actionsInitiated + '.';
        }

        const result = await MeasureService.updateComplianceAddResult2(
            resultType,
            complianceId,
            resultDate,
            historyMessage,
            userId,
            comments,
            actionRating,
            actionsInitiated,
            resultsDetail,
        );

        if (result.hasError) {
            console.log('one less lonely girl');

            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to add the result.",
                    {
                        error: {
                            sql: 'Failed to add the result.',
                        },
                        sqlError: result.sql,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }

        /**
         * Handles sending of emails if there are actions initiated.
         */
        MeasureService.sendNotificationEmails(complianceId, actionsInitiated, actionRating);

        let complianceActionInitiatedTypeId = actionRating === 'Critical Defect'
            ? 2
            : 1;

        if (adviseAdministrator || adviseManager) {
            MeasureService.addActionInitiatedHistory(complianceId, complianceActionInitiatedTypeId, adviseManager, adviseAdministrator, userId);
        }

        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Successfully added the result.",
                {
                    data: {
                        msg: "Successfully added the result.",
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function updateComplianceAddResultOld(req, res) {

        const complianceId = req.param('compliance_id');
        const userId = req.param('id');
        const resultDate = req.param('result_date');
        let status = req.param('result_type');

        const complianceDetails = (await MeasureService.getComplianceMeasureRawById(complianceId))[0];

        let latestStatus = complianceDetails['latest_status'];

        const storedProcStatus = status;

        console.log('storedProcStatus: ' + storedProcStatus);

        if (status === '') {
            status = 'Uncheked New Entry';
        } else if (status === 0) {
            status = 'Fail';
        } else {
            status = 'Pass';
        }

        if (latestStatus === null) {
            latestStatus = 'Uncheked New Entry';
        } else if (latestStatus === 0) {
            latestStatus = 'Fail';
        } else {
            latestStatus = 'Pass';
        }

        console.log('storedProcStatus: ' + storedProcStatus);

        const comments = typeof req.param('comments') !== "undefined" ? req.param('comments') : '';

        const historyMsg = `Status, from "${latestStatus}" to "${status}".`;

        // Changes here.

        // New vars.
        let actionRating = req.param('defect_type');
        let advise_Manager = req.param('advise_manager');
        let adviseAdministrator = req.param('advise_administrator');

        // New method.
        const result = await MeasureService.updateComplianceAddResult2(
            storedProcStatus,
            complianceId,
            resultDate,
            historyMsg,
            userId,
            comments,
            actionRating,
            advise_Manager,
            adviseAdministrator,
        );

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to add the result.",
                    {
                        error: {
                            sql: 'Failed to add the result.',
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
                "Successfully added the result.",
                {
                    data: {
                        msg: "Successfully added the result.",
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function addDocumentToPublicRepository(fileDirectory, file, newFileName) {

        const fileDirectoryIsExisting = await Utils.getFileIfExists(fileDirectory);

        if (fileDirectoryIsExisting === false) {
            // Make file sync.
            fs.mkdirSync(fileDirectory);
        }

        let moveFileName = file.image.name;

        if (typeof newFileName !== "undefined") {
            moveFileName = newFileName;
        }

        file.image.mv(fileDirectory + '/' + moveFileName);
    }

    async function updateComplianceDocument(req, res) {

        const complianceId = req.param('compliance_id');
        const userId = req.param('id');
        const locationId = req.param('location_wide_document');
        const file = req.files;
        const fileReceived = req.files.image.name;

        let fileIteration = 0;
        let complianceDocumentId = '';

        const fileDetails = await MeasureService.getDocumentIteration(fileReceived, complianceId);

        if (fileDetails.length === 0) {
            fileIteration = 0;
            complianceDocumentId = '';
        } else {
            fileIteration = parseFloat(fileDetails[0]['iteration']);
            complianceDocumentId = fileDetails[0]['id'];
        }

        const fileDirectory = 'public/' + complianceId;

        if (fileIteration === 0) {
            // Do regular insert.
            addDocumentToPublicRepository(fileDirectory, file);
            
            const result = await MeasureService.updateComplianceDocument(
                complianceId,
                fileReceived,
                fileDirectory + '/' + fileReceived,
                userId,
                '',
                locationId
            );

            if (result) {
                res.send(
                    Utils.responseBuilder(
                        200,
                        "SUCCESS",
                        "Successfully added a document.",
                        {
                            data: {
                                msg: "Successfully added a document.",
                            },
                            operation: 'ADD_SUCCESS',
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            }
        } else {
            const iterator = fileIteration + 1;

            let fileExtension = fileReceived.split('.');

            fileExtension = fileExtension[fileExtension.length - 1];

            let newName = fileReceived.substring(0, fileReceived.length - (fileExtension.length + 1));
            let iterationSuffix = iterator.toString();

            while (iterationSuffix.length < 3) {
                iterationSuffix = '0' + iterationSuffix;
            }

            iterationSuffix = '_' + iterationSuffix;

            newName = newName + iterationSuffix + '.' + fileExtension;

            addDocumentToPublicRepository(fileDirectory, file, newName);

            const result = await MeasureService.updateComplianceDocument(
                complianceId,
                newName,
                fileDirectory + '/' + newName,
                userId,
                complianceDocumentId,
                locationId
            );

            if (result) {
                res.send(
                    Utils.responseBuilder(
                        200,
                        "SUCCESS",
                        "Successfully added a document.",
                        {
                            data: {
                                msg: "Successfully added a document.",
                            },
                            operation: 'ADD_SUCCESS',
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            }
        }
    }

    async function getUploadedDocuments(req, res) {

        const complianceId = req.param('compliance_id');
        const locationId = req.param('location_id');

        const result = await MeasureService.getUploadedDocuments(complianceId, locationId);

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

            return;
        }

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

    async function addComplianceInput(req, res, next) {

        let complianceId = req.param('hello');
        let resultType = req.param('result_type');
        let actionRating = req.param('action_rating');

        // Do regular updates if either pass or fail.

        if (resultType === 'Fail') {
            // If critical defect, email alerts are mandatory.

        }

        if (resultType === 'Pass') {
            // Do regular update.
        }

        res.send({
            a: 'b',
            z: 'b',
            s: 'b',
            aaa: 'b',
        });
    }

    async function test(req,res, next) {
        try {
            // const html = await EmailService.fetchTemplate('non-critical-defect.html');

            res.send(html);
        } catch (e) {
            res.send('error');
        }

    }

    // This will serve the view.
    async function getMyPortfolioReport(req, res) {
        try {
            const managementCompanyId = req.param('management_company_id');
            const byspace = req.param('byspace');

            // Feed this function with managers.
            const result = await MeasureService.getMyPortfolioReport(managementCompanyId, byspace);

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
        } catch (err) {
            res.send(
                Utils.responseBuilder(
                    400,
                    "FAILURE",
                    "Failed to query the ",
                    {
                        error: {
                            msg: JSON.stringify(err),
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getMyPortfolioReportOld(req, res) {
        try {
            const managerId = req.param('manager_id');

            // Feed this function with managers.
            const result = await MeasureService.getMyPortfolioReportOld(managerId);

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
        } catch (err) {
            res.send(
                Utils.responseBuilder(
                    400,
                    "FAILURE",
                    "Failed to query the ",
                    {
                        error: {
                            msg: JSON.stringify(err),
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getManagers(req, res) {
        const managementCompanyId = req.param('management_company_id');

        try {
            const result = await MeasureService.getManagers(managementCompanyId);

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
        } catch (err) {
            res.send(
                Utils.responseBuilder(
                    400,
                    "FAILURE",
                    "Failed to query the ",
                    {
                        error: {
                            msg: JSON.stringify(err),
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    function getMyPortfolioReportStyles(req, res) {
        res.send(
            Utils.responseBuilder(
                200,
                "SUCCESS",
                "Successfully queried the compliance measures.",
                {
                    data: `
                        /**
                            Resets
                         */
                        
                        /*GLOBAL RESET SETUP*/
                        * {
                            margin: 0;
                            padding: 0;
                        }
                        
                        *,
                        *::before,
                        *::after {
                            box-sizing: inherit;
                        }
                        
                        html {
                            box-sizing: border-box;
                        }
                        /*-----------------*/
                        
                        /* HTML5 display-role reset for older browsers */
                        article, aside, details, figcaption, figure,
                        footer, header, hgroup, menu, nav, section {
                            display: block;
                        }
                        body {
                            line-height: 1;
                            -webkit-print-color-adjust: exact !important;/*To show background colors for print*/
                        }
                        ol, ul {
                            list-style: none;
                        }
                        blockquote, q {
                            quotes: none;
                        }
                        blockquote:before, blockquote:after,
                        q:before, q:after {
                            content: '';
                            content: none;
                        }
                        table {
                            border-collapse: collapse;
                            border-spacing: 0;
                        }
                        
                        /**
                            end of Resets
                         */
                        
                        html {
                            font-family: 'Roboto', sans-serif;
                            color: #cecece;
                        }
                        
                        .container {
                            width: 80%;
                            margin: 0 auto;
                        }
                        
                        #report {
                            padding: 20px;
                        }
                        
                        #report-date {
                        
                        }
                        
                        /* #divider {
                            border: 1px solid #dfdfdf;
                        } */
                        
                        
                        
                        /*//////////////////////////////////////*/
                        /*COMPONENTS*/
                        
                        /* Info component-------> Icon + Label + Value*/
                        
                        
                        .info > i {
                            color: #BF1E2E;
                            font-size: 18px;
                        }
                        
                        .info__title {
                            color: #BF1E2E;
                            margin-left: 12px;
                        }
                        
                        .info__value {
                            color: #000;
                            margin-left: 8px;
                        }
                        
                        
                        /*//////////////////////////////////////*/
                        /*HEADER*/
                        .header {
                            padding: 30px 0;
                            /* background: #faf9f9; */
                        
                        }
                        
                        
                        /*//////////////////////////////////////*/
                        /*CONTENT*/
                        .content {
                            /* background-color: #f0eeee; */
                            padding: 10px 30px;
                        }
                        
                        .details {
                            padding: 20px 0;
                            margin-bottom: 8px;
                        }
                        
                        .details__info {
                            margin-right: 171px;
                            display: inline-block; 
                        }
                        
                        
                        /*TABLE*/
                        th, td {
                            text-align: left;
                        }
                        
                        .table {
                            width: 100%;
                        }
                        
                        .table__header-row {
                            background-color: #f0eeee; /*rgb(229, 229, 229)*/
                            border: solid 1px rgb(229, 229, 229);
                        }
                        
                        .table__header {
                            color: #000;
                            padding: 18px 15px;
                            text-transform: uppercase;
                            font-size: 14px;
                        }
                        
                        .table__data-row {
                            border: solid 1px rgb(229, 229, 229);
                        }
                        
                        .table__data {
                            color: #000;
                            padding: 30px 15px;
                            font-size: 13px;
                        }
                        
                        .cell-width-sm {
                            width: 13%;
                        }
                        
                        .cell-width-md {
                           width: 15%
                        }
                        
                        .cell-width-lg {
                           width: 35%;
                        }
                        
                        .data-align-top {
                            vertical-align: top;
                        }
                        
                        .text-green {
                            color: green;
                        }
                        
                        .data-chip-pass {
                            background-color: green;
                            color: #fff;
                            padding: 2px 10px;
                            border-radius: 3px;
                        }
                        
                        .data-chip-fail {
                            background-color: red;
                            color: #fff;
                            padding: 2px 10px;
                            border-radius: 3px;
                        }
                        
                        td .space {
                            margin-bottom: 30px;
                        }
                        
                        td .space:last-child {
                            margin-bottom: 0px;
                        }
                        
                        .sub-text-link:link,
                        .sub-text-link:visited{
                            margin-bottom: 10px;
                            color: #BF1E2E;
                            text-decoration: none;
                        } 
                        
                        .sub-text-link:hover {
                            text-decoration: underline;
                        }
                        
                        .margin-l {
                            margin-left: 30px;
                        }
                        
                        /*//////////////////////////////////////*/
                        /*FOOTER*/
                        .footer {
                            color: rgb(172, 172, 172);
                            text-align: center;
                            font-size: 12px;
                            margin: 10px 50px;
                        }
                        
                        .container {
                            width: 100%;
                            margin: 0 auto;
                        }
                        
                        #report {
                            padding-top: 0;
                        }
                        
                        /*//////////////////////////////////////*/
                        /*COMPONENTS*/
                        
                        /* Info component-------> Icon + Label + Value*/
                        .info > i {
                            font-size: 14px;
                        }
                        
                        .info__title {
                            margin-left: 5px;
                            font-size: 12px;
                        }
                        
                        .info__value {
                            margin-left: 0;
                            font-size: 12px;
                        }
                        
                        /*//////////////////////////////////////*/
                        /*HEADER*/
                        .header {
                            padding: 15px 0;
                            /* background: #faf9f9; */
                        }
                        
                        /*//////////////////////////////////////*/
                        /*CONTENT*/
                        .content {
                            padding: 8px 20px;
                        }
                        
                        .details {
                            padding: 10px 0;
                        }
                        
                        .details__info {
                            margin-right: 30px;
                        }
                        
                        /*TABLE*/
                        .table__header {
                            padding: 16px 10px;
                            font-size: 10px;
                            font-weight: 600;
                        }
                        
                        
                        .table__data {
                            color: #000;
                            padding: 20px 10px;
                            font-size: 11px;
                        }
                        
                        .cell-width-sm {
                             width: 13%;
                        }
                        
                        .cell-width-md {
                            width: 18%
                        }
                        
                        .cell-width-lg {
                            width: 32%;
                        }
                        
                        .data-chip {
                            background-color: green;
                            color: #fff;
                            padding: 2px 8px;
                            border-radius: 3px;
                        }
                        
                        td .space {
                            margin-bottom: 15px;
                        }
                        
                        .sub-text {
                            margin-top: -10px;
                        }
                        
                        
                        /*//////////////////////////////////////*/
                        /*FOOTER*/
                        
                        .footer__box {
                            height: 64px;
                            width: 100%;
                            
                            background-color: #fafafa;
                            position: fixed;
                            bottom: 0;
                            padding-top: 16;
                        }
                        
                        .footer {
                            color: rgb(172, 172, 172);
                            text-align: center;
                            font-size: 12px;
                            margin: 10px 50px;
                        }
                          
                        @page {
                            margin2: 10mm 0mm 0mm 0mm;
                            margin: 0;
                            border-bottom: 0;
                        }
                    `,
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    async function getArchives(req, res) {

        const managementCompanyId = req.param('management_company_id');

        try {
            const result = await MeasureService.getArchives(managementCompanyId);

            res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully queried the compliance report archives.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        } catch (err) {
            res.send(
                Utils.responseBuilder(
                    400,
                    "FAILURE",
                    "Failed to query the compliance report archives.",
                    {
                        error: {
                            msg: JSON.stringify(err),
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getArchive(req, res) {

        const archiveId = req.param('archive_id');
        const managementCompanyId = req.param('management_company_id');

        try {
            let result = await MeasureService.getArchive(archiveId, managementCompanyId);

            if (result.length === 0) {
                return res.send(
                    Utils.responseBuilder(
                        400,
                        "FAILURE",
                        "Failed to query the compliance report archive.",
                        {
                            error: {
                                msg: 'No results found.',
                            },
                            payload: Utils.extractRequestParams(req)
                        }
                    )
                );
            }

            res.send(
                Utils.responseBuilder(
                    200,
                    "SUCCESS",
                    "Successfully queried the compliance report archive.",
                    {
                        data: JSON.parse(result[0]['content']),
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        } catch (err) {
            res.send(
                Utils.responseBuilder(
                    400,
                    "FAILURE",
                    "Failed to query the compliance report archive.",
                    {
                        error: {
                            msg: JSON.stringify(err),
                        },
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function getResultDetailsByComplianceId(req, res) {

        const complianceId = req.param('compliance_id');

        const result = await MeasureService.getResultDetailsByComplianceId(complianceId);

        if (result.hasError) {
            res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to query the compliance measure history.",
                    {
                        error: {
                            sql: 'Failed to query the compliance measure history.',
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
                    "Successfully queried the compliance measure history.",
                    {
                        data: result,
                        payload: Utils.extractRequestParams(req)
                    }
                )
            );
        }
    }

    async function updateResultsDetail(req, res) {

        const complianceResultDetailId = req.param('compliance_result_detail_id');
        const userId = req.param('id');
        const status = req.param('status');
        const date = req.param('date');
        const defectType = req.param('defect_type');
        const comments = req.param('comments');
        
        const result = await MeasureService.updateComplianceResultDetail(complianceResultDetailId, status, date, defectType, comments, userId);

        if (result.hasError) {
            return res.send(
                Utils.responseBuilder(
                    500,
                    "FAIL",
                    "Failed to update the compliance result detail.",
                    {
                        error: {
                            sql: 'Failed to update the compliance result detail.',
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
                "Successfully updated the compliance result detail.",
                {
                    data: {
                        msg: "Successfully updated the compliance result detail.",
                    },
                    operation: 'UPDATE_SUCCESS',
                    payload: Utils.extractRequestParams(req)
                }
            )
        );
    }

    return {
        test: test,
        updateResultsDetail: updateResultsDetail,
        getResultDetailsByComplianceId: getResultDetailsByComplianceId,
        getMyPortfolioReportStyles: getMyPortfolioReportStyles,
        getArchives: getArchives,
        getArchive: getArchive,
        getManagers: getManagers,
        getMyPortfolioReportOld: getMyPortfolioReportOld,
        getMyPortfolioReport: getMyPortfolioReport,
        addComplianceInput: addComplianceInput,
        getUploadedDocuments: getUploadedDocuments,
        updateComplianceDocument: updateComplianceDocument,
        getFilters: getFilters,
        getHistoryByComplianceId: getHistoryByComplianceId,
        updateComplianceDueDate: updateComplianceDueDate,
        updateComplianceAddResult: updateComplianceAddResult,
        updateComplianceAddResult2: updateComplianceAddResult2,
        userHasCompliances: userHasCompliances,
        getComplianceMeasures: getComplianceMeasures,
        getComplianceMeasureById: getComplianceMeasureById,
        getCompaniesWithAccess: getCompaniesWithAccess,
        getLocationsWithAccess: getLocationsWithAccess,
        getSpacesWithAccess: getSpacesWithAccess,
        getComplianceCategoriesWithAccess: getComplianceCategoriesWithAccess,
    }
})();

module.exports = Measures;