require('dotenv').config();

const express = require('express');
const app = express();
const mysqlConnection = require('./establishMySQLConnection');


var OAuthClient = require('intuit-oauth');

var oauthClient = new OAuthClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    environment: 'production',
    redirectUri: process.env.REDIRECT_URL
});

const quickbooksService = require('./services/quickbooks/quickbooks')(oauthClient);

mysqlConnection();

const API = {
    NEW_ACCESS_TOKEN: '',
    NEW_REFRESH_TOKEN: '',
};

const API2 = (() => {
    const baseUrl = '';

    return {
        NEW_ACCESS_TOKEN: '',
        NEW_REFRESH_TOKEN: '',
    }
});

app.get('/signInWithIntuitV2', (req, res) => {

    // Scope options determine what you are able to access.
    var authUri = quickbooksService.signInWithIntuit();

    res.redirect(authUri);
});

app.get('/callback', (req, res) => {
    var parseRedirect = req.url;

    oauthClient.createToken(parseRedirect)
        .then(function (authResponse) {
            quickbooksService.saveAuthData(authResponse);
            const dataTokens = authResponse.getJson();

            global.oauthTokens = dataTokens;

            res.send(dataTokens);
        })
        .catch(function (e) {
            console.error("The error message is :" + e.originalMessage);
            console.error(e.intuit_tid);
        });
});

app.get('/sign_in_with_intuit', (req, res) => {

    // Scope options determine what you are able to access.
    var authUri = oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
        state: 'testState'
    });  // can be an array of multiple scopes ex : {scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId]}

    res.redirect(authUri);
});

app.get('/companyDetails', async (req, res) => {
    try {
        const request = require('request');
        let oauthTokens = await quickbooksService.getAuthData()
        const ACCESS_TOKEN = oauthTokens[0].access_token;
        const COMPANY_ID = '4620816365002626190';

        const headers = {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            Accept: 'application/json'
        };
        request({
            headers: headers,
            uri: `https://sandbox-quickbooks.api.intuit.com/v3/company/${COMPANY_ID}/companyinfo/${COMPANY_ID}/?minorversion=12&type=json&Accept=application/json`,
            method: 'GET'
        }, function (err, ress, body) {
            if (err) {
                var authUri = quickbooksService.signInWithIntuit();
                res.redirect(authUri);
            } else {
                res.send(body);
            }
        });
    } catch (err) {
        res.send({
            err: JSON.stringify(err)
        });
    }
});

app.get('/createInvoice', async (req, res) => {
    try {
        const request = require('request');
        let oauthTokens = await quickbooksService.getAuthData()
        const ACCESS_TOKEN = oauthTokens[0].access_token;
        const COMPANY_ID = '4620816365002626190';

        const headers = {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
        const data = {
            "Line": [
                {
                    "DetailType": "SalesItemLineDetail",
                    "Amount": 100.0,
                    "SalesItemLineDetail": {
                        "ItemRef": {
                            "name": "Services",
                            "value": "1"
                        }
                    }
                }
            ],
            "CustomerRef": {
                "value": "59"
            }
        }
        request({
            headers: headers,
            uri: `https://sandbox-quickbooks.api.intuit.com/v3/company/${COMPANY_ID}/invoice?minorversion=12&type=json&Accept=application/json`,
            method: 'POST',
            json: data
        }, function (err, ress, body) {
            if (err) {
                // var authUri = quickbooksService.signInWithIntuit();
                // res.redirect(authUri);
            } else {
                res.send(body);
            }
        });
    } catch (err) {
        res.send({
            err: JSON.stringify(err)
        });
    }
});

app.get('/createCustomer', async (req, res) => {
    try {
        const request = require('request');
        let oauthTokens = await quickbooksService.getAuthData()
        const ACCESS_TOKEN = oauthTokens[0].access_token;
        const COMPANY_ID = '4620816365002626190';

        const headers = {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
        const data = {
            "BillAddr": {
                "Line1": "123 Main Street",
                "City": "Mountain View",
                "Country": "USA",
                "CountrySubDivisionCode": "CA",
                "PostalCode": "94042"
            },
            "Notes": "Here are other details.",
            "DisplayName": "Jameson Test 2",
            "PrimaryPhone": {
                "FreeFormNumber": "(555) 555-5555"
            },
            "PrimaryEmailAddr": {
                "Address": "jdrew@myemail.com"
            }
        }
        request({
            headers: headers,
            uri: `https://sandbox-quickbooks.api.intuit.com/v3/company/${COMPANY_ID}/customer?minorversion=12&type=json&Accept=application/json`,
            method: 'POST',
            json: data
        }, function (err, ress, body) {
            console.log(err, body)
            if (body.fault && body.fault.type === 'AUTHENTICATION') {
                getRefreshToken();
            }
            console.log(body)
            res.send(body);
        });
    } catch (err) {
        res.send({
            err: JSON.stringify(err)
        });
    }
});

app.get('/getAllCustomers', async (req, res) => {
    try {
        const request = require('request');
        let oauthTokens = await quickbooksService.getAuthData()
        const ACCESS_TOKEN = oauthTokens[0].access_token;
        const COMPANY_ID = '4620816365002626190';

        const headers = {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            Accept: 'application/json'
        };
        request({
            headers: headers,
            uri: `https://sandbox-quickbooks.api.intuit.com/v3/company/${COMPANY_ID}/query?minorversion=12&type=json&Accept=application/json`,
            method: 'POST',
            data: 'Select * from Customer startposition 1 maxresults 5'
        }, function (err, ress, body) {
            if (err) {
                var authUri = quickbooksService.signInWithIntuit();
                res.redirect(authUri);
            } else {
                res.send(body);
            }
        });
    } catch (err) {
        res.send({
            err: JSON.stringify(err)
        });
    }
});

let getRefreshToken = async function () {
    let oauthTokens = await quickbooksService.getAuthData()
    const REFRESH_TOKEN = oauthTokens[0].refresh_token;
    oauthClient.refreshUsingToken(REFRESH_TOKEN)
        .then(function (authResponse) {
            console.log(authResponse)
            quickbooksService.saveAuthData(authResponse);
        })
        .catch(function (e) {
            console.log(e);
            console.error("The error message is :" + e.originalMessage);
            console.error(e.intuit_tid);
        });
};
app.get('/getNewAccessToken', (req, res) => {
    getRefreshToken();
    res.send(true)
});

app.get('/getNewRefreshToken', (req, res) => {
    getRefreshToken();
    res.send(true)
});

app.listen(3000, () => {
    console.log('going to port: 3000');
});
