var express = require('express'),
    _ = require('lodash'),
    transaction = require('../database/transaction'),
    db = require('../database/database'),
    OAuthClient = require('intuit-oauth'),
    Utils = require('../../services/utils');

const Service = (oauthClient) => (((oauthClient) => {

    function signInWithIntuit(management_company_id) {
        const scopes = {
            scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
            state: management_company_id
        };

        return oauthClient.authorizeUri(scopes);
    }

    async function saveAuthData(authData, state, realmId) {
        try {
            authData = authData.getJson();

            const refreshToken = authData['refresh_token'];
            const tokenType = authData['token_type'];
            const accessToken = authData['access_token'];
            const accessTokenExpireTime = authData['expires_in'];

            try {
                await db.query(`
                              INSERT INTO quickbooks_auth 
                              (state, realm_id, refresh_token, token_type, access_token, access_token_expiry) 
                              VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))
                `, [state, realmId, refreshToken, tokenType, accessToken, accessTokenExpireTime], 1);
            } catch (err) {
                console.log('error');
                console.log(err);
            }
        } catch (err) {
            throw new Error('Something went wrong when trying to save the auth data.');
        }
    }
    async function updateAuthData(authData, managementCompanyId) {
        try {
            authData = authData.getJson();

            const refreshToken = authData['refresh_token'];
            const tokenType = authData['token_type'];
            const accessToken = authData['access_token'];
            const accessTokenExpireTime = authData['expires_in'];

            try {
                await db.query(`
                    UPDATE quickbooks_auth
                        SET
                            refresh_token = ?,
                            token_type = ?,
                            access_token = ?,
                            access_token_expiry = DATE_ADD(NOW(), INTERVAL ? SECOND)
                        WHERE state = ?
                `, [refreshToken, tokenType, accessToken, accessTokenExpireTime, managementCompanyId], 1);
            } catch (err) {
                console.log('error');
                console.log(err);
            }
        } catch (err) {
            throw new Error('Something went wrong when trying to save the auth data.');
        }
    }
    async function getAuthData(id) {
        try {
            let query = await db.query(`SELECT * FROM quickbooks_auth WHERE state = ?`, [id], 1);
            return query;
        } catch (err) {
            console.log('error');
            console.log(err);
        }

    }

    // Make new schema regarding quickbooks.

    /**
     * refresh_token TEXT
     * refresh_token_last_updated
     * access_token TEXT
     * access_token_last_updated
     */

    return {
        getAuthData: getAuthData,
        saveAuthData: saveAuthData,
        signInWithIntuit: signInWithIntuit,
        updateAuthData: updateAuthData
    }
})(oauthClient));

module.exports = Service;