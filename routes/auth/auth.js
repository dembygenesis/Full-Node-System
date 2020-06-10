var express     = require('express'),
    router      = express.Router(),
    Middleware = require('../../middlewares/auth/auth'),
    Controller  = require('../../controllers/auth/auth');

router.post('/auth',
    Middleware.authRequiredFields,
    Controller.auth2
);

// router.post('/auth',
//     Middleware.authRequiredFields,
//     Controller.auth
// );

router.post('/auth2',
    Middleware.authRequiredFields,
    Controller.auth2
);


router.post('/addUser',
    Middleware.authRequiredFields,
);

router.post('/getUserDetailsByToken',
    Middleware.validateTokenAndExtractAccountType,
    Controller.getUserDetailsByToken,
);

module.exports = router;