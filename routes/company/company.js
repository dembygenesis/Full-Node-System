var express     = require('express'),
    router      = express.Router(),
    Middleware = require('../../middlewares/company/company'),
    AuthMiddleware = require('../../middlewares/auth/auth'),
    Controller  = require('../../controllers/companies/companies');

router.post('/addCompany',
    Middleware.addCompanyRequiredFields,
    Middleware.checkName,
    Controller.addCompany
);

router.post('/updateCompany',
    Middleware.updateCompanyRequiredFields,
    Middleware.checkNameToUpdate,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.updateCompany
);

router.post('/voidCompany',
    Middleware.voidCompanyRequiredFields,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.voidCompany
);

router.post('/getCompanyByCreator',

    // Update to UPDATE.
    Controller.getCompanyByCreator
);

/**
 * Privilege routes.
 */

router.post('/assignCompanyToReviewers',
    Middleware.assignCompanyToReviewersRequiredFields,
    Middleware.reviewerIdListValidator,
    Middleware.userListMustInSameManagementCompanyAsClient,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.assignCompanyToReviewers
);

router.post('/assignCompanyToUsers',
    Middleware.assignCompanyToUsersRequiredFields,
    Middleware.userIdListValidator,
    Middleware.userListMustInSameManagementCompanyAsClient,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.assignCompanyToUsers
);

router.post('/revokeCompanyFromReviewers',
    Middleware.assignCompanyToUsersRequiredFields,
    Middleware.reviewerIdListValidator,
    Middleware.userListMustInSameManagementCompanyAsClient,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.revokeCompanyFromReviewers
);

router.post('/revokeCompanyFromUsers',
    Middleware.assignCompanyToUsersRequiredFields,
    Middleware.userIdListValidator,
    Middleware.userListMustInSameManagementCompanyAsClient,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.revokeCompanyFromUsers
);

router.post('/getCreatedAndAssignedCompanies',
    Controller.getCreatedAndPrivilegedCompanies
);

router.post('/getAccountHolderCompanies',
    Controller.getAccountHolderCompanies
);

router.post('/getUserAccessDetailByCompanyId',
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.getCreatedAndPrivilegedCompaniesByCompanyId
);

router.post('/getReviewerAccessDetailByCompanyId',
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.getReviewerCreatedAndPrivilegedCompaniesByCompanyId
);

router.post('/getCompanyDetailsById',
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.getCompanyById
);


/**
 * =============================
 * Standard V2 routes.
 * =============================
 */

router.get('/getAll',
    Controller.getAccountHolderCompanies
);

router.get('/getOne/:company_id',
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.getCompanyById
);

router.post('/add',
    Middleware.addCompanyRequiredFields,
    Middleware.checkName,
    Controller.addCompany
);

router.post('/update',
    Middleware.updateCompanyRequiredFields,
    Middleware.checkNameExceptOwn,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.updateCompany
);

router.post('/saveCreditCard',
    Middleware.saveCreditCardRequiredFields,
    Middleware.checkNameExceptOwn,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.saveCreditCard
);


router.delete('/void',
    Middleware.voidCompanyRequiredFields,
    Middleware.companyMustBeInSimilarManagementCompany,
    Middleware.hasNoDependencies,
    Controller.voidCompany
);

/**
 * =============================
 * Sub routes - Assignment Module & Reviewer Module.
 * =============================
 */

const routerAssignmentAccountHolder = express.Router();

// Disabled
// const routerAssignmentReviewer      = express.Router();

router.use('/accountHolderAssignment', routerAssignmentAccountHolder);

// Disabled.
// router.use('/reviewerAssignment', routerAssignmentReviewer);

/**
 * getUserAccessDetailByCompanyId
 * getReviewerAccessDetailByCompanyId
 */

// Company Account Holder.
routerAssignmentAccountHolder.get('/getOne/:company_id',
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.getCreatedAndPrivilegedCompaniesByCompanyId
);

routerAssignmentAccountHolder.post('/add',
    Middleware.assignCompanyToUsersRequiredFields,
    Middleware.userIdListValidator,
    Middleware.userListMustInSameManagementCompanyAsClient,
    Middleware.companyMustBeInSimilarManagementCompany,
    Middleware.assignedAccountHolderCompanyHasNoCurrentActive,
    Controller.assignCompanyToUsers
);

routerAssignmentAccountHolder.delete('/void',
    Middleware.assignCompanyToUsersRequiredFields,
    Middleware.userIdListValidator,
    Middleware.userListMustInSameManagementCompanyAsClient,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.revokeCompanyFromUsers
);

// Reviewer.
// Disabled.
/*routerAssignmentReviewer.get('/getOne/:company_id',
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.getReviewerCreatedAndPrivilegedCompaniesByCompanyId
);

routerAssignmentReviewer.post('/add',
    Middleware.assignCompanyToReviewersRequiredFields,
    Middleware.reviewerIdListValidator,
    Middleware.userListMustInSameManagementCompanyAsClient,
    Middleware.companyMustBeInSimilarManagementCompany,
    Middleware.assignedReviewerCompanyHasNoCurrentActive,
    Controller.assignCompanyToReviewers
);

routerAssignmentReviewer.delete('/void',
    Middleware.assignCompanyToUsersRequiredFields,
    Middleware.reviewerIdListValidator,
    Middleware.userListMustInSameManagementCompanyAsClient,
    Middleware.companyMustBeInSimilarManagementCompany,
    Controller.revokeCompanyFromReviewers
);*/

module.exports = router;