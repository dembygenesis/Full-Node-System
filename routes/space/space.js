var express     = require('express'),
    router      = express.Router(),
    Middleware = require('../../middlewares/space/space'),
    AuthMiddleware = require('../../middlewares/auth/auth'),
    LocationMiddleware = require('../../middlewares/location/location'),
    Controller  = require('../../controllers/space/space');

router.post('/addSpace',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkSpaceRequiredFields,
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Controller.addSpace
);

router.post('/updateSpace',

    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkSpaceRequiredFields,

    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Middleware.checkSpaceAccess,
    Controller.updateSpace
);

router.post('/deleteSpace',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkSpaceAccess,
    Controller.deleteSpace
);

router.post('/getSpaces',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer',  'Account Holder']),
    Controller.getSpaces
);

router.post('/getSpaceById',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAdministratorOrAccountHolder,
    Middleware.checkSpaceAccess,
    Controller.getSpaceById
);

router.post('/getSpacesByLocationId',

    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getSpacesByLocationId
);

router.post('/getLocationFilters',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    Controller.getLocationFilters
);

router.post('/userHasLocations',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    Controller.userHasLocations
);

/**
 * =============================
 * Standard V2 routes.
 * =============================
 */

router.get('/accessCheck',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    Controller.userHasLocations
);

router.get('/getAll',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    Controller.getSpaces
);

router.get('/getFiltered',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Controller.getSpacesByLocationId
);

router.get('/getOne/:space_id',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.checkSpaceAccess,
    Controller.getSpaceById
);

router.post('/add',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.checkSpaceRequiredFields,
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Controller.addSpace
);

router.post('/update',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.checkSpaceRequiredFields,
    LocationMiddleware.locationHasAccessThroughCompaniesAssigned,
    Middleware.checkSpaceAccess,
    Controller.updateSpace
);

router.delete('/void',
    AuthMiddleware.isOfAccount(['Administrator', 'Account Holder']),
    Middleware.checkSpaceAccess,
    Middleware.hasNoDependencies,
    Controller.deleteSpace
);

/**
 * =============================
 * Sub route - filters.
 * =============================
 */

const routerFilters = express.Router();

router.use('/filters', routerFilters);

routerFilters.get('/getAll',
    AuthMiddleware.isOfAccount(['Manager', 'Administrator', 'Reviewer', 'Account Holder']),
    Controller.getLocationFilters
);

module.exports = router;