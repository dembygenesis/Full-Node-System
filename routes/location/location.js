var express     = require('express'),
    router      = express.Router(),
    Middleware = require('../../middlewares/location/location'),
    AuthMiddleware = require('../../middlewares/auth/auth'),
    CompanyMiddleware = require('../../middlewares/company/company'),
    Controller  = require('../../controllers/location/location');

router.post('/addLocation',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkLocationRequiredFields,


    CompanyMiddleware.companyMustBeOwnedOrAssignedByClient,


    Controller.addLocation
);

router.post('/deleteLocation',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkLocationId,
    // Middleware.locationIsCreatedByClient,
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Controller.deleteLocation
);

router.post('/updateLocation',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkLocationRequiredFields,

    // CompanyMiddleware.companyMustBeOwnedByClient,
    CompanyMiddleware.companyMustBeOwnedOrAssignedByClient,

    Middleware.checkLocationId,
    // Middleware.locationIsCreatedByClient,
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Controller.updateLocation
);


router.post('/getLocationById',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    // Middleware.locationIsCreatedByClient,
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getLocationById
);

router.post('/getLocations',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Controller.getLocations
);

router.post('/getLocationsByManagementId',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolderOrReviewer,
    Controller.getLocationsByManagementId
);

router.post('/getLocationsByCompany',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolderOrReviewer,
    CompanyMiddleware.companyMustBeOwnedOrAssignedByClient,
    Controller.getLocationsByCompany
);

router.post('/getStates',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Administrator',  'Account Holder', 'Super Administrator']),
    Controller.getStates
);

router.post('/getPostCodesByState',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.isValidState,
    Controller.getPostCodesByState
);

router.post('/getCompanyFilters',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolderOrReviewer,
    Controller.getCompanyFilters
);

router.post('/getLocationTypes',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Controller.getLocationTypes
);

router.post('/userHasCompanies',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolderOrReviewer,
    Controller.userHasCompanies
);

router.post('/userHasCompaniesWithLocations',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolderOrReviewer,
    Controller.userHasCompaniesWithLocations
);

router.post('/getAssignableManagersByManagementId',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getAssignableManagersByManagementId
);

router.post('/assignLocationToManager',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Middleware.assignLocationToManagerRequiredFields,
    Middleware.userIdListValidator,
    Controller.assignLocationToManager
);

router.post('/removeLocationFromManager',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Middleware.assignLocationToManagerRequiredFields,
    Middleware.userIdListValidator,
    Controller.removeLocationFromManager
);

/**
 * =============================
 * Standard V2 routes.
 * =============================
 */

router.post('/add',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.checkLocationRequiredFields,
    CompanyMiddleware.companyMustBeOwnedOrAssignedByClient,
    Controller.addLocation
);

router.post('/update',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.checkLocationRequiredFields,
    CompanyMiddleware.companyMustBeOwnedOrAssignedByClient,
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Controller.updateLocation
);

router.delete('/void',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Middleware.hasNoDependencies,
    Controller.deleteLocation,
);

router.get('/accessCheck',
    AuthMiddleware.isOfAccount(['Administrator', 'Reviewer', 'Account Holder']),
    Controller.userHasCompaniesWithLocations
);

/*router.get('/accessCheck/:company_id',
    AuthMiddleware.isOfAccount(['Administrator', 'Reviewer']),
    Controller.userHasCompaniesWithLocations
);*/

router.get('/accessCheckHasCompanies',
    AuthMiddleware.isOfAccount(['Administrator', 'Reviewer', 'Account Holder']),
    Controller.userHasCompanies
);

router.get('/getAll',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolderOrReviewer,
    Controller.getLocationsByManagementId
);

router.get('/getFiltered',
    AuthMiddleware.isOfAccount(['Administrator', 'Reviewer', 'Account Holder']),
    CompanyMiddleware.companyMustBeOwnedOrAssignedByClient,
    Controller.getLocationsByCompany
);

router.get('/getOne/:location_id',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getLocationById
);

/**
 * =============================
 * Sub route - filters
 * =============================
 */

const routerFilters = express.Router();

router.use('/filters', routerFilters);

routerFilters.get('/company/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Reviewer', 'Account Holder']),
    Controller.getCompanyFilters
);

routerFilters.get('/states/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Super Administrator', 'Account Holder']),
    Controller.getStates
);

/**
 * =============================
 * Sub route - types
 * =============================
 */

const routerTypes = express.Router();

router.use('/types', routerTypes);

routerTypes.get('/getAll',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Controller.getLocationTypes
);

/**
 * =============================
 * Sub route - privileges
 * =============================
 */

const routerPrivileges = express.Router();

router.use('/privileges', routerPrivileges);

routerPrivileges.get('/getOne/:location_id',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getAssignableManagersByManagementId
);

routerPrivileges.post('/add',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Middleware.assignLocationToManagerRequiredFields,
    Middleware.userIdListValidator,
    Middleware.assignedManagerCompanyHasNoCurrentActive,
    Controller.assignLocationToManager
);

routerPrivileges.post('/void',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.locationHasAccessThroughCompaniesAssigned,
    Middleware.assignLocationToManagerRequiredFields,
    Middleware.userIdListValidator,
    Controller.removeLocationFromManager
);

module.exports = router;