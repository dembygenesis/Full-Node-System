var express     = require('express'),
    router      = express.Router(),
    Middleware = require('../../middlewares/quickbook/quickbook'),
    Controller  = require('../../controllers/quickbook/quickbook');

router.get('/signInWithIntuitV2',
    Middleware.authRequiredFields,
    Controller.signInWithIntuit
);

router.get('/callback',
    Controller.callback
);


module.exports = router;