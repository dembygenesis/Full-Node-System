var express = require('express'),
    _       = require('lodash'),
    db = require('../database/database'),
    Mandrill = require('node-mandrill'),
    Gmail = require('gmail-send'),
    fs = require('fs'),
    path = require('path'),
    trimNewlines = require('trim-newlines'),
    MeasureService = require('../../services/measure/measure'),
    Utils = require('../../services/utils');

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const sendOverdueIncomingAlerts = async function () {

    const managementIds = await db.query('SELECT * FROM management_company');

    for (let i in managementIds) {
        const managementCompanyId = managementIds[i]['id'];

        console.log('managementCompanyId: ' + managementCompanyId);

        const overdueManagerItems = await MeasureService.getItemsOfConcern(
            'Manager',
            managementCompanyId
        );

        const overdueAdministratorItems = await MeasureService.getItemsOfConcern(
            'Administrator',
            managementCompanyId
        );

        console.log('overdueAdministratorItems', overdueAdministratorItems);
        console.log('overdueManagerItems', overdueManagerItems);

        if (overdueAdministratorItems.length > 0) {
            // Loop and process emails if not null.
            console.log('go: ' + managementCompanyId);
            console.log(overdueAdministratorItems);
        }

        if (overdueManagerItems.length > 0) {
            // Loop and process emails if not null.
            console.log('go: ' + managementCompanyId);
            console.log(overdueManagerItems);
        }

        // Administrators are A-ok!
        /*if (overdueAdministratorItems.length > 0) {
            for (let i in overdueAdministratorItems) {
                console.log(overdueAdministratorItems[i]);
                let email = overdueAdministratorItems[i]['email'];
                let items = overdueAdministratorItems[i]['data'];

                console.log('email', email);views/userTypes
            }
        }

        if (overdueManagerItems.length > 0) {
            for (let i in overdueManagerItems) {
                console.log(overdueManagerItems[i]);
                let email = overdueManagerItems[i]['email'];
                let items = overdueManagerItems[i]['data'];

                console.log('email', email);
                console.log('items', items);
            }
        }*/

        // How about managers?


        // console.log('overdueManagerItems', overdueManagerItems);
        // console.log('overdueAdministratorItems', overdueAdministratorItems);
    }
};

const sendEmail = async function (emailTo, content) {
    /*const oauth2Client = new OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_SECRET_ID,
        "https://developers.google.com/oauthplayground",
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const tokens = await oauth2Client.getRequestHeaders();

    const accessToken = tokens.Authorization;*/

    // This is an smtp email not connected to gmail.
    const smtpTransport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    /*const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "dmcchy@gmail.com",
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_SECRET_ID,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: accessToken
        }
    });*/

    const mailOptions = {
        from: "notification@compliancelinc.com.au",
        to: emailTo,
        subject: "ComplianceLinc Account Created (no reply)",
        generateTextFromHTML: true,
        html: content
    };

    // Send off email with config above...
    smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response);
        smtpTransport.close();
    });
};

const sendWelcomeEmail = async function (
    emailTo,
    username,
    password,
    accountType,
    template
) {
    // Fetch corresponding email template.
    const emailTemplate = require(`./templates/${template}`);

    // Append variables to template.
    let htmlContent = emailTemplate.replace('user_username', username)
        .replace('user_account_type', accountType)
        .replace('user_password', password);

    await sendEmail(emailTo, htmlContent);
};

const sendItemNotificationEmail = function (emailTo, overdue, incoming) {
    // Pass successes and failures.
    let emailTemplate = require('./templates/' + 'items_of_concern');

    let replace_overdue = '';
    let replace_incoming = '';

    if (incoming.length > 0) {

        replace_incoming += `
            <tr>
                <td>
                    <br/>
                    <p style="
                        font-size: 12px;
                        font-family: Helvetica;
                        margin: 0px;
                        padding: 0px;
                    ">
                        <b>(${incoming.length})</b> <i>incoming</i>
                    </p>
                </td>
            </tr>
        `;

        for (let i in incoming) {
            const incomingItem = incoming[i];

            replace_incoming += `
                <tr>
                    <td style="
                        margin-top: 0;
                        margin-bottom: 0;
                        padding-top: 5px;
                        padding-bottom: 0;
                    ">
                        <table style="
                            max-width: 600px;
                            border-collapse: collapse; 
                            margin: 0;
                            padding: 0;
                        ">
                            <tr>
                                <td style="
                                    width: 300px;
                                    margin: 0;
                                    padding: 0;
                                    height: 30px;
                                    background-color: #ffebab;
                                    position: relative;
                                ">
                                    <p style="
                                        margin: 0;
                                        padding: 0;
                                        text-align: left;
                                        margin-left: 10px;	
                                    ">
                                        <a href="#" style="
                                            margin: 0;
                                            padding: 0;
                                            top: 0;
                                            color: #7e7e80;
                                            font-weight: bold;
                                            font-size: 15px;
                                            text-decoration: underline;
                                        ">
                                            ${incomingItem.name}
                                        </a>
                                    </p>
                                </td>
        
                                <td style="
                                    width: 300px;
                                    margin: 0;
                                    padding: 0;
                                    height: 30px;
                                    background-color: #ffebab;
                                ">	
                                    <p style="
                                        margin: 0;
                                        padding: 0;
                                        text-align: right;
                                        color: #7e7e80;
                                        font-weight: bold;
                                        font-size: 15px;
                                        margin-right: 10px;
                                    ">
                                        Due in ${incomingItem.val} Days
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `;
        }
    }

    if (overdue.length > 0) {
        replace_overdue += `
            <tr>
                <td>
                    <br/>
                    <p style="
                        font-size: 12px;
                        font-family: Helvetica;
                        margin: 0px;
                        padding: 0px;
                    ">
                        <b>(${overdue.length})</b> <i>overdue</i>
                    </p>
                </td>
            </tr>
        `;

        for (let i in overdue) {
            const overdueItem = overdue[i];

            replace_overdue += `
                <tr>
                    <td style="
                        margin-top: 0;
                        margin-bottom: 0;
                        padding-top: 5px;
                        padding-bottom: 0;
                    ">
                        <table style="
                            max-width: 600px;
                            border-collapse: collapse; 
                            margin: 0;
                            padding: 0;
                        ">
                            <tr>
                                <td style="
                                    width: 300px;
                                    margin: 0;
                                    padding: 0;
                                    height: 30px;
                                    background-color: #bf1d2d;
                                    position: relative;
                                ">
                                    <p style="
                                        margin: 0;
                                        padding: 0;
                                        text-align: left;
                                        margin-left: 10px;
                                    ">
        
                                        <a href="#" style="
                                            margin: 0;
                                            padding: 0;
                                            top: 0;
                                            color: white;
                                            font-weight: bold;
                                            font-size: 15px;
                                            text-decoration: underline;
                                        ">
                                            ${overdueItem.name}
                                        </a>
                                    </p>
                                </td>
        
                                <td style="
                                    width: 300px;
                                    margin: 0;
                                    padding: 0;
                                    height: 30px;
                                    background-color: #bf1d2d;
                                ">	
                                    <p style="
                                        margin: 0;
                                        padding: 0;
                                        text-align: right;
                                        color: white;
                                        font-weight: bold;
                                        font-size: 15px;
                                        margin-right: 10px;
                                    ">
                                        ${overdueItem.val} Days Overdue
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `;
        }
    }

    emailTemplate = emailTemplate.replace('replace_overdue', replace_overdue).replace('replace_incoming', replace_incoming);
    emailTemplate = emailTemplate.replace('live_url', process.env.LIVE_URL);

    sendEmail(emailTo, emailTemplate)
        .then(res => {

        })
        .catch(err => {
            console.log('ERror sending email for notifications');
        })
};

// What would be nice is the replacements?
const fetchTemplate = function (name) {

    let dir = path.join(__dirname, `templates/${name}`);

    return new Promise((resolve, reject) => {
        fs.readFile(dir, 'utf8', function (err, data) {
            if (err) {
                return reject(err);
            }

            // Remove spaces, tabs, and line breaks.
            data.replace(/\n|\r|\t+/g, " ");
            data.replace(/\s+/g, " ");

            resolve(data);
        });
    });
};

const sendActionInitiatedEmails = async function (sendTo, complianceName) {
    console.log('shit');
    // console.log(fetchTemplate);
    // let template = await fetchTemplate('non-critical-defect.html');

    // console.log(template);
};


module.exports = {
    sendActionInitiatedEmails: sendActionInitiatedEmails,
    fetchTemplate: fetchTemplate,
    sendEmail: sendEmail,
    sendWelcomeEmail: sendWelcomeEmail,
    sendItemNotificationEmail: sendItemNotificationEmail,
    sendOverdueIncomingAlerts: sendOverdueIncomingAlerts,
};

// exports.sendEmail = sendEmail;
// exports.sendWelcomeEmail = sendWelcomeEmail;
// exports.sendItemNotificationEmail = sendItemNotificationEmail;
// exports.sendOverdueIncomingAlerts = sendOverdueIncomingAlerts;