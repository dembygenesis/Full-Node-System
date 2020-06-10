var express = require('express'),
    router = express.Router(),
    Middleware = require('../../middlewares/users/users'),
    AuthMiddleware = require('../../middlewares/auth/auth'),
    Controller = require('../../controllers/users/users');

router.post('/updateSelf',
    Middleware.updateUserSelfRequiredFields,
    Controller.updateUserSelf
);


module.exports = router;