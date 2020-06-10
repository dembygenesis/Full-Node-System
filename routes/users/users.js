var express = require('express'),
    router = express.Router(),
    Middleware = require('../../middlewares/users/users'),
    AuthMiddleware = require('../../middlewares/auth/auth'),
    Controller = require('../../controllers/users/users');

router.get('/test',
    Controller.getSampleData
);

/**
 * View Routes.
 */

router.post('/views/managementCompanies',
    AuthMiddleware.validateTokenAndExtractAccountType,
    Controller.getManagementCompanies
);

router.post('/views/userTypes',
    AuthMiddleware.validateTokenAndExtractAccountType,
    Middleware.checkAllowedAccountTypes,
    Controller.getAccountTypes
);

router.post('/views/userDetails',
    AuthMiddleware.validateTokenAndExtractAccountType,
    Middleware.checkUserViewPrivilege,
    Controller.getUserDetails
);

router.get('/views/users',
    AuthMiddleware.validateTokenAndExtractAccountType,
    Middleware.checkMultiUserViewPrivilege,
    Controller.getUsers
);

router.post('/views/getUserActivityInSameManagementCompany',
    AuthMiddleware.validateTokenAndExtractAccountType,
    AuthMiddleware.isAccountHolder,
    Controller.getUserActivityInSameManagementCompany
);

/**
 * Standard API Routes.
 */

router.post('/addUser',
    AuthMiddleware.validateTokenAndExtractAccountType,
    Middleware.addUserRequiredFields,
    Middleware.checkAddUserPrivileges,
    Controller.addUser
);

router.post('/voidUser',
    AuthMiddleware.validateTokenAndExtractAccountType,
    Middleware.voidUserRequiredFields,
    Middleware.checkVoidUserPrivileges,
    Controller.voidUser
);

router.post('/updateUser',
    AuthMiddleware.validateTokenAndExtractAccountType,
    Middleware.updateUserRequiredFields,
    Controller.updateUser
);

router.post('/addUserActivity',
    AuthMiddleware.validateTokenAndExtractAccountType,
    Middleware.checkAddUserActivityRequiredFields,
    Controller.addUserActivity
);

/**
 * NEW USER API METHODS USING PROPER API REQUEST PROTOCOLS. (enterprise level baby)
 * This user is prefixed with user... (it's ok)
 * Base Route is "user" which has the standard functions like getOne, getMany, getAll etc
 * What about user types? We make a new sub route called userType
 * @type {Router|router}
 */

/**
 * =============================
 * Standard V2 routes.
 * =============================
 */

router.get('/getAll',
    Middleware.checkMultiUserViewPrivilege,
    Controller.getUsers
);

router.get('/getOne/:user_id',
    Middleware.checkUserViewPrivilege,
    Controller.getUserDetails
);

router.delete('/void',
    Middleware.voidUserRequiredFields,
    Middleware.checkVoidUserPrivileges,
    // For now prevent this user from being voided if he created any compliances active compliances or active companies or locations.
    Middleware.checkUserCreatedEntries,
    Controller.voidUser
);

router.post('/add',
    Middleware.addUserRequiredFields,
    Middleware.checkAddUserPrivileges,
    Controller.addUser
);

router.post('/update',
    Middleware.updateUserRequiredFields,
    Controller.updateUser
);

router.post('/updateSelf',
    Middleware.updateUserSelfRequiredFields,
    Controller.updateUserSelf
);

router.post('/approve',
    Middleware.checkApproveUserPrivileges,
    Middleware.approveUserRequiredFields,
    Controller.approveUser
);
/**
 * =============================
 * Sub Route: User Type.
 * =============================
 */

const routerUserType = express.Router();

router.use('/userType', routerUserType);

routerUserType.get('/getAll',
    Middleware.checkAllowedAccountTypes,
    Controller.getAccountTypes
);

/**
 * =============================
 * Sub Route: Management Company.
 * =============================
 */

const routerManagementCompany = express.Router();

router.use('/managementCompany', routerManagementCompany);

routerManagementCompany.get('/getAll',
    Controller.getManagementCompanies
);


module.exports = router;