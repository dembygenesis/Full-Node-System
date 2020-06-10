var express     = require('express'),
    Middleware = require('../../middlewares/complianceMeasure/complianceMeasure'),
    Controller = require('../../controllers/complianceMeasure/complianceMeasure'),
    router      = express.Router();

router.post('/getComplianceMeasures', Controller.getComplianceMeasures);

router.post('/getComplianceMeasureCategory', Controller.getComplianceMeasureCategory);
router.post('/getComplianceMeasureFrequencyCategory', Controller.getComplianceMeasureFrequencyCategory);

router.post('/getComplianceMeasureById',
    Middleware.complianceMeasureId,
    Controller.getComplianceMeasureById
);

router.post('/updateComplianceMeasure',
    Middleware.updateComplianceRequiredFields,
    Controller.updateCompliance
);

module.exports = router;