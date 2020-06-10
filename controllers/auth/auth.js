const express = require('express'),
    crypto = require('crypto'),
    AuthService = require('../../services/auth/auth'),
    ManagementCompanyService = require('../../services/managementCompany/managementCompany'),
    LocationService = require('../../services/location/location'),
    Utils = require('../../services/utils');

const Auth = (function () {

    async function authenticate(username, password, remember_me) {
        try {
            const authenticationAttempt = await AuthService.authenticate(username, password);

            if (authenticationAttempt.length === 1) {
                let authenticated = authenticationAttempt[0];

                authenticated['remember_me'] = (remember_me === true);

                try {
                    const result = await generateSession(authenticated);

                    return authenticated;
                } catch (err) {

                    return false;
                }
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    function generateSession(result) {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(20, function (err, buffer) {
                let token = buffer.toString('hex');

                AuthService.updateUserToken(result.id, token, result.remember_me)
                    .then(res => resolve({token: token, details: result}))
                    .catch(err => reject())
            });
        })
    }

    async function auth2(req, res) {
        let username = req.body.username
            , password = req.body.password
            , rememberMe = Utils.objectChecker(req.body, ['remember_me']) === true;

        try {
            // Get user via username and password.
            const user = await AuthService.getUserByUserAndPass(username, password);

            // Fail if not found.
            if (user.length === 0) {
                return res.send(
                    Utils.responseBuilder(400, "FAIL", "Login Failed.", {
                        msg: 'Login Failed.',
                        errors: [
                            "Invalid Username and/or Password",
                        ],
                        payload: Utils.extractRequestParams(req)
                    })
                );
            }

            const userDetails = user[0];

            const result = await ManagementCompanyService.getManagementCompanyDetails(userDetails.management_company_id);
            const location = await LocationService.getLocationsPaymentStatusByManagementId(userDetails.management_company_id, userDetails.id, userDetails.user_type);
            userDetails.location = location
            userDetails.company = result[0]

            const expiredToken = parseFloat(user[0]['token_expired']);

            if (expiredToken || isNaN(expiredToken)) {
                const newToken = await AuthService.generateToken();

                const userId = user[0]['id'];

                await AuthService.updateUserToken(userId, newToken, rememberMe);

                res.send(
                    Utils.responseBuilder(200, "SUCCESS", "Login Successful.", {
                        msg: `Login Successful. Welcome '${userDetails.lastname}, ${userDetails.firstname}.'`,
                        data: {
                            token: newToken,
                            user_details: userDetails
                        },
                        payload: Utils.extractRequestParams(req)
                    })
                );

            } else {
                res.send(
                    Utils.responseBuilder(200, "SUCCESS", "Login Successful.", {
                        msg: `Login Successful. Welcome '${userDetails.lastname}, ${userDetails.firstname}.'`,
                        data: {
                            token: userDetails.token,
                            user_details: userDetails
                        },
                        payload: Utils.extractRequestParams(req)
                    })
                );
            }
        } catch (err) {
            return res.send(
                Utils.responseBuilder(400, "FAIL", "Login Failed.", {
                    msg: 'Login Failed.',
                    errors: [
                        "Something went wrong when trying to authenticate the user.",
                    ],
                    payload: Utils.extractRequestParams(req)
                })
            );
        }
    }

    async function auth(req, res) {

        let username = req.body.username
            , password = req.body.password
            , remember_me = Utils.objectChecker(req.body, ['remember_me']) === true;

        try {
            const result = await authenticate(username, password, remember_me);
            
            if (result) {
                const session = await generateSession(result);

                console.log('generating session: ' + session['token']);

                res.send(
                    Utils.responseBuilder(200, "SUCCESS", "Login Successful.", {
                        msg: `Login Successful. Welcome '${session['details'].lastname}, ${session['details'].firstname}.'`,
                        data: {
                            token: session['token'],
                            user_details: result
                        },
                        payload: Utils.extractRequestParams(req)
                    }));
            } else {
                res.send(
                    Utils.responseBuilder(400, "FAIL", "Login Failed.", {
                        msg: 'Login Failed.',
                        errors: [
                            "Invalid Username and/or Password",
                        ],
                        payload: Utils.extractRequestParams(req)
                    }));
            }
        } catch (err) {
            res.send(
                Utils.responseBuilder(200, "FAIL", "Login Failed.", {
                    msg: 'Login Failed.',
                    errors: [
                        "Invalid Username and/or Password",
                    ],
                    payload: Utils.extractRequestParams(req)
                }));
        }
    }

    async function getUserDetailsByToken(req, res) {

        /**
         * req.body.user_type = userAccountType;
           req.body.firstname = userFirstName;
           req.body.lastname = userLastName;
           req.body.user_type_id = parseFloat(userTypeId);
           req.body.id = parseFloat(userId);
         */
        res.send(
            Utils.responseBuilder(200, "SUCCESS", "Login Successful.", {
                msg: `Token validation successful.`,
                data: {
                    firstname: req.param('firstname'),
                    lastname: req.param('lastname'),
                    userType: req.param('user_type'),
                    id: req.param('id'),
                    company: req.param('company'),
                    location: req.param('location'),
                },
                payload: Utils.extractRequestParams(req)
            })
        );
    }

    return {
        auth: auth,
        auth2: auth2,
        getUserDetailsByToken: getUserDetailsByToken,
    }
})();

module.exports = Auth;