var express     = require('express'),
    router      = express.Router(),
    Middleware = require('../../middlewares/measure/measure'),
    AuthMiddleware = require('../../middlewares/auth/auth'),
    CompanyMiddleware = require('../../middlewares/company/company'),
    LocationMiddleware = require('../../middlewares/location/location'),
    ComplianceMiddleware = require('../../middlewares/compliance/compliance'),
    SpaceMiddleware = require('../../middlewares/space/space'),
    Controller  = require('../../controllers/measure/measure');

router.post('/getFilters',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Controller.getFilters
);

router.post('/getCompaniesWithAccess',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    Controller.getCompaniesWithAccess
);

router.post('/getLocationsWithAccess',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    CompanyMiddleware.companyMustBeAssignedByClient,
    Controller.getLocationsWithAccess
);

router.post('/getSpacesWithAccess',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getSpacesWithAccess
);

router.post('/getComplianceCategoriesWithAccess',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    SpaceMiddleware.checkSpaceAccess,
    Controller.getComplianceCategoriesWithAccess
);

router.post('/userHasCompliances',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    Controller.userHasCompliances
);

router.post('/getComplianceMeasures',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    Middleware.getComplianceMeasures,
    CompanyMiddleware.companyMustBeOwnedOrAssignedByClient,
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    SpaceMiddleware.checkSpaceAccessIfProvided,
    Controller.getComplianceMeasures
);

router.post('/getComplianceMeasureById',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Controller.getComplianceMeasureById
);

router.post('/updateComplianceDueDate',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    ComplianceMiddleware.checkComplianceAccess,
    Middleware.checkValidDueDate,
    Controller.updateComplianceDueDate
);

router.post('/updateComplianceAddResult',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolderOrComplianceContributor,
    ComplianceMiddleware.checkComplianceAccess,
    Middleware.checkAddResultFields,
    Controller.updateComplianceAddResult
);

router.post('/getHistoryByComplianceId',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Controller.getHistoryByComplianceId
);

router.post('/upload',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolderOrComplianceContributor,
    ComplianceMiddleware.checkComplianceAccess,
    Middleware.checkUploadDocumentFields,
    Controller.updateComplianceDocument
);

router.post('/getUploadedDocuments',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Controller.getUploadedDocuments
);

/**
 * =============================
 * Standard V2 routes.
 * =============================
 */

router.post('/test',
    Controller.test
);

router.get('/accessCheck',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    Controller.userHasCompliances
);

router.get('/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    Middleware.getComplianceMeasures,
    CompanyMiddleware.companyMustBeOwnedOrAssignedByClient,
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    SpaceMiddleware.checkSpaceAccessIfProvided,
    Controller.getComplianceMeasures
);

/**
 * =============================
 * Sub route - results
 * =============================
 */

const routerResults = express.Router();

router.use('/results', routerResults);

routerResults.post('/add',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Middleware.checkAddResultsFields,
    Controller.updateComplianceAddResult
);

routerResults.post('/add2',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Middleware.checkAddResultsFields,
    Controller.updateComplianceAddResult2
);

/**
 * =============================
 * Sub route - filters
 * =============================
 */

const routerFilters = express.Router();

router.use('/filters', routerFilters);

routerFilters.get('/company/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    Controller.getCompaniesWithAccess
);

routerFilters.get('/location/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    CompanyMiddleware.companyMustBeAssignedByClient,
    Controller.getLocationsWithAccess
);

routerFilters.get('/space/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getSpacesWithAccess
);

routerFilters.get('/complianceCategory/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    SpaceMiddleware.checkSpaceAccess,
    Controller.getComplianceCategoriesWithAccess
);

/**
 * =============================
 * Measure Reports.
 * =============================
 */

const routerReports = express.Router();

router.use('/report', routerReports);

routerReports.get('/myPortfolioStyles',
    Controller.getMyPortfolioReportStyles
);

routerReports.get('/archives',
    Controller.getArchives
);

routerReports.get('/archive/:archive_id',
    Controller.getArchive
);

routerReports.get('/myPortfolio',
    // AuthMiddleware.isOfAccount(['Manager']),
    Middleware.myPortfolioReport,
    Controller.getMyPortfolioReportOld
);

routerReports.get('/myPortfolioReport',
    // AuthMiddleware.isOfAccount(['Manager']),
    Controller.getMyPortfolioReport
);

routerReports.get('/managers',
    Controller.getManagers
);

/**
 * =============================
 * Measure Details.
 * =============================
 */

const routerDetails = express.Router();

router.use('/details', routerDetails);

routerDetails.get('/getOne/:compliance_id',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Controller.getComplianceMeasureById
);

routerDetails.post('/duedate/update',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Middleware.checkValidDueDate,
    Controller.updateComplianceDueDate
);
// Document.
routerDetails.get('/documents/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Controller.getComplianceMeasureById
);

// Uploads.
routerDetails.get('/documents/uploaded/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Controller.getUploadedDocuments
);

// History.
routerDetails.get('/history/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Controller.getHistoryByComplianceId
);

// Result Details.
routerDetails.get('/resultDetails/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccess,
    Controller.getResultDetailsByComplianceId
);

routerDetails.post('/resultDetails/update',
    AuthMiddleware.isOfAccount(['Administrator', 'Compliance Certifier', 'Manager', 'Reviewer', 'Account Holder']),
    ComplianceMiddleware.checkComplianceAccessThroughComplianceResultId,
    Controller.updateResultsDetail
);


module.exports = router;