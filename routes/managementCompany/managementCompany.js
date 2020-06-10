var express = require('express'),
    router = express.Router(),
    Middleware = require('../../middlewares/managementCompany/managementCompany'),
    AuthMiddleware = require('../../middlewares/auth/auth'),
    Controller = require('../../controllers/managementCompany/managementCompany');

router.post('/updateLogo',
    Middleware.checkLogo,
    Controller.updateLogo
);

router.post('/updateName',
    Middleware.checkName,
    Controller.updateName
);

router.post('/updateSiteWideMessage',
    Middleware.checkSiteWideMessage,
    Controller.updateSiteWideMessage
);

router.get('/getManagementCompanyDetails',
    Controller.getManagementCompanyDetails
);

router.get('/getLogo',
    Controller.getLogo
);


module.exports = router;