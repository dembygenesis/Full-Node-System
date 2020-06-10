var express = require('express'),
    router = express.Router(),
    Middleware = require('../../middlewares/billing/billing'),
    Controller = require('../../controllers/billing/billing');

router.get('/getBillingMessage',
    Middleware.getMessageRequiredFields,
    Controller.getBillingMessage
);

module.exports = router;