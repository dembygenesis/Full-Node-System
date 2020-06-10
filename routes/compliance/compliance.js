var express     = require('express'),
    router      = express.Router(),
    CompanyMiddleware = require('../../middlewares/company/company'),
    SpaceMiddleware = require('../../middlewares/space/space'),
    LocationMiddleware = require('../../middlewares/location/location'),
    Middleware = require('../../middlewares/compliance/compliance'),
    AuthMiddleware = require('../../middlewares/auth/auth'),
    Controller  = require('../../controllers/compliance/compliance');

router.post('/getComplianceFilters',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Controller.getComplianceFilters
);

router.post('/getCompaniesWithSpaces',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),

    Controller.getCompaniesWithSpaces
);

router.post('/getLocationTypesWithCompanies',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    CompanyMiddleware.companyMustBeAssignedByClient,
    Controller.getLocationTypesWithCompanies
);


// Old route.
router.post('/getLocationsWithSpaces',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolderOrManager,
    CompanyMiddleware.companyMustBeAssignedByClient, // Need new middleware here
    Middleware.locationTypeByCompanyMustHaveSpaces,
    Controller.getLocationsWithSpaces // Pending
);

router.post('/getLocationsFromLocationTypeWithSpaces',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    CompanyMiddleware.companyMustBeAssignedByClient,
    Middleware.locationTypeByCompanyMustHaveSpaces,
    Controller.getLocationsFromLocationTypeWithSpaces
);

router.post('/getSpacesByLocation',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getSpacesByLocation
);

router.post('/getComplianceById',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Controller.getComplianceById
);

router.post('/getCompliances',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Controller.getCompliances
);

router.post('/getComplianceCategories',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Controller.getComplianceCategories
);

router.post('/getAttachableComplianceCategories',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getAttachableComplianceCategories,
);

router.post('/getComplianceMeasures',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Controller.getComplianceMeasures
);

router.post('/addCompliance',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkComplianceRequiredFields,
    Middleware.checkComplianceMeasureIds,
    Middleware.checkComplianceMeasureIdsStateAccess,
    SpaceMiddleware.checkSpaceAccess,
    Middleware.checkInsertForExistingEntries,
    Controller.addCompliance
);

router.post('/updateCompliance',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkComplianceRequiredFields,
    SpaceMiddleware.checkSpaceAccess,
    Middleware.checkComplianceAccess,
    Controller.updateCompliance
);

router.post('/deleteCompliance',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkComplianceAccess,
    Controller.deleteCompliance
);

router.post('/getComplianceCategoriesAndMeasures',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Controller.getComplianceCategoriesAndMeasures
);


// I'll use this to prevent compliance creation.
router.post('/hasSpaces',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    Controller.hasSpaces
);

router.post('/spaceHasCompliance',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    SpaceMiddleware.checkSpaceAccess,
    Controller.spaceHasCompliance
);

router.post('/getCompliancesFromSpaceId',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    SpaceMiddleware.checkSpaceAccess,
    Controller.getCompliancesFromSpaceId
);


router.post('/getNonCheckedMeasuresByComplianceCategory',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    SpaceMiddleware.checkSpaceAccess,
    Middleware.checkValidComplianceCategoryId,
    Controller.getNonCheckedMeasuresByComplianceCategory
);

router.post('/updateComplianceContributor',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkUpdateComplianceContributorFields,
    Controller.updateComplianceContributor
);

/**
 * =============================
 * Standard V2 routes.
 * =============================
 */

router.get('/getAll',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator','Account Holder',  'Reviewer']),
    SpaceMiddleware.checkSpaceAccess,
    Controller.getCompliancesFromSpaceId
);

router.get('/accessCheck',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Account Holder', 'Reviewer']),
    Controller.hasSpaces
);

router.post('/add',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.checkComplianceRequiredFields,
    Middleware.checkComplianceMeasureIds,
    Middleware.checkComplianceMeasureIdsStateAccess,
    SpaceMiddleware.checkSpaceAccess,
    Middleware.checkInsertForExistingEntries,
    Controller.addCompliance
);

router.delete('/void',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.checkComplianceAccess,

    // Not sure this will be needed.
    // Middleware.hasNoDependencies,
    Middleware.complianceIdListValidator,
    Controller.deleteCompliance
);


/**
 * =============================
 * Sub route - non checked measures
 * =============================
 */

const routerNonCheckedMeasures = express.Router();

router.use('/nonCheckedMeasures', routerNonCheckedMeasures);

routerNonCheckedMeasures.get('/getAll',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    SpaceMiddleware.checkSpaceAccess,
    Middleware.checkValidComplianceCategoryId,
    Controller.getNonCheckedMeasuresByComplianceCategory
);

/**
 * =============================
 * Sub route - filters
 * =============================
 */

const routerFilters = express.Router();

router.use('/filters', routerFilters);

routerFilters.get('/company/getAll',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    Controller.getCompaniesWithSpaces
);

routerFilters.get('/locationType/getAll',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    CompanyMiddleware.companyMustBeAssignedByClient,
    Controller.getLocationTypesWithCompanies
);

routerFilters.get('/location/getAll',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    CompanyMiddleware.companyMustBeAssignedByClient,
    Middleware.locationTypeByCompanyMustHaveSpaces,
    Controller.getLocationsFromLocationTypeWithSpaces
);

routerFilters.get('/space/getAll',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getSpacesByLocation
);


module.exports = router;