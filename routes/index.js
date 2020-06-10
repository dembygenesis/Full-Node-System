let express = require('express');

/**
 * Bootstraps your app with routes.
 */

module.exports = app => {

    const authMiddleware = require('../middlewares/auth/auth');

    /**
     * Routes
     *
     * Declare route variables below for easy migration to v2.
     */

    let users               = require('./users/users'),
        profile             = require('./profile/profile'),
        billing             = require('./billing/billing'),
        managementCompany   = require('./managementCompany/managementCompany'),
        companies           = require('./company/company'),
        location            = require('./location/location'),
        space               = require('./space/space'),
        compliance          = require('./compliance/compliance'),
        measure             = require('./measure/measure'),
        complianceMeasure   = require('./complianceMeasure/complianceMeasure'),
        thirdParty          = require('./thirdParty/thirdParty'),
        auth                = require('./auth/auth'),
        quickbook                = require('./quickbook/quickbook');

    /**
     * Version 1.
     */

    const routerV1 = express.Router();

    routerV1.use('/test', users);

    routerV1.use(
        '/billing',
        // authMiddleware.validateTokenAndExtractAccountType,
        billing
    );

    routerV1.use(
        '/profile',
        authMiddleware.validateTokenAndExtractAccountType,
        profile
    );

    routerV1.use(
        '/thirdParty',
        thirdParty
    );

    routerV1.use(
        '/managementCompany',
        authMiddleware.validateTokenAndExtractAccountType,
        authMiddleware.isOfAccount(['Account Holder', 'Administrator','Manager']),
        managementCompany
    );

    routerV1.use(
        '/users',
        authMiddleware.validateTokenAndExtractAccountType,
        authMiddleware.isOfAccount(['Super Administrator', 'Account Holder', 'Administrator']),
        users
    );

    routerV1.use('/companies',
        authMiddleware.validateTokenAndExtractAccountType,
        authMiddleware.isOfAccount(['Account Holder']),
        companies
    );

    routerV1.use('/location',
        authMiddleware.validateTokenAndExtractAccountType,
        location
    );

    routerV1.use('/space',
        authMiddleware.validateTokenAndExtractAccountType,
        space
    );

    routerV1.use('/compliance',
        authMiddleware.validateTokenAndExtractAccountType,
        compliance
    );

    routerV1.use('/measure',
        authMiddleware.validateTokenAndExtractAccountType,
        measure
    );

    routerV1.use('/auth', auth);

    routerV1.use('/complianceMeasure',
        authMiddleware.validateTokenAndExtractAccountType,
        authMiddleware.isOfAccount(['Super Administrator']),
        complianceMeasure
    );
    routerV1.use('/quickbook', quickbook);

    app.use('/api/v1', routerV1);
};
