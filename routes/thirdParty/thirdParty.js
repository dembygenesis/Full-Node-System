var express = require('express'),
    router = express.Router(),
    Middleware = require('../../middlewares/users/users'),
    Controller = require('../../controllers/users/users');

router.post('/managementCompany/add',
    Middleware.addManagementCompanyRequiredFields,
    Controller.addManagementCompany
);

module.exports = router;