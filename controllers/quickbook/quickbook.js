const express = require('express'),
    Utils = require('../../services/utils');

var OAuthClient = require('intuit-oauth');

var oauthClient = new OAuthClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    environment: 'production',
    redirectUri: process.env.REDIRECT_URL
});
const QuickbooksService = require('../../services/quickbooks/quickbooks')(oauthClient);

const Quickbook = (function () {
    async function signInWithIntuit(req, res) {
        let management_company_id =  req.param('management_company_id');
        var authUri = await QuickbooksService.signInWithIntuit(management_company_id);
        res.redirect(authUri);
    }

    async function callback(req, res){
        var parseRedirect = req.url;

        oauthClient.createToken(parseRedirect)
            .then(function (authResponse) {
                QuickbooksService.saveAuthData(authResponse, req.param("state"), req.param("realmId"));
                const dataTokens = authResponse.getJson();

                global.oauthTokens = dataTokens;

                res.send(dataTokens);
            })
            .catch(function (e) {
                console.error("The error message is :" + e.originalMessage);
                console.error(e.intuit_tid);
                res.send(e)
            });
    }
    return {
        signInWithIntuit: signInWithIntuit,
        callback: callback
    }
})();

module.exports = Quickbook;