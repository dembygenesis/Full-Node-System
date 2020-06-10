require('dotenv').config();

const OAuthClient = require('intuit-oauth');

const oauthClient = new OAuthClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    environment: 'production',
    redirectUri: process.env.REDIRECT_URL
});
// const mysqlConnection = require('./establishMySQLConnection');
// mysqlConnection();
const quickbooksService = require('./services/quickbooks/quickbooks')(oauthClient);

const billingService = require('./services/billing/billing');


let getRefreshToken = async function (managementCompanyId) {
    let oauthTokens = await quickbooksService.getAuthData(managementCompanyId);
    if (oauthTokens[0]) {
        const REFRESH_TOKEN = oauthTokens[0].refresh_token;
        return oauthClient.refreshUsingToken(REFRESH_TOKEN)
            .then(function (authResponse) {
                quickbooksService.updateAuthData(authResponse, managementCompanyId);
                return true;
            })
            .catch(function (e) {
                console.log(e);
                console.error("The error message is :" + e.originalMessage);
                console.error(e.intuit_tid);
            });
    } else {
        return false
    }

};
let getInvoice = async (managementCompanyId, invoiceId) => {
    const request = require('request');
    let oauthTokens = await quickbooksService.getAuthData(managementCompanyId);
    const ACCESS_TOKEN = oauthTokens[0].access_token;
    const COMPANY_ID = oauthTokens[0].realm_id;
    const INVOICE_ID = invoiceId;

    const headers = {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        Accept: 'application/json',
    };
    return new Promise((resolve, reject) => {
        request({
            headers: headers,
            uri: `https://quickbooks.api.intuit.com/v3/company/${COMPANY_ID}/invoice/${INVOICE_ID}?minorversion=12&type=json&Accept=application/json`,
            method: 'GET',
        }, function (err, ress, body) {
            if (body.Fault && body.Fault.Error) {
                reject(JSON.stringify(body.Fault.Error));
            }
            resolve(JSON.parse(body));
        });
    })
}
let createInvoice = async (managementCompanyId, companyLocation, customerRefId, rate, count) => {
    const request = require('request');
    let oauthTokens = await quickbooksService.getAuthData(managementCompanyId);
    const ACCESS_TOKEN = oauthTokens[0].access_token;
    const COMPANY_ID = oauthTokens[0].realm_id;

    const headers = {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
    const data = {
        "Line": [
            {
                "DetailType": "SalesItemLineDetail",
                "Amount": Number(rate * count),
                "Description": companyLocation.location_name,
                "SalesItemLineDetail": {
                    "ItemRef": {
                        "name": "Services",
                        "value": 1
                    },
                    "Qty": count,
                    "UnitPrice": rate,
                },
            }
        ],
        "CustomerRef": {
            "value": customerRefId
        },
        "BillEmail": {
            "Address": companyLocation.email
        },
    };
    return new Promise((resolve, reject) => {
        request({
            headers: headers,
            uri: `https://quickbooks.api.intuit.com/v3/company/${COMPANY_ID}/invoice?minorversion=12&type=json&Accept=application/json`,
            method: 'POST',
            json: data
        }, function (err, ress, body) {
            if (body.Fault && body.Fault.Error) {
                reject(JSON.stringify(body.Fault.Error));
            }
            resolve(body);
        });
    })
}
let createCustomer = async (managementCompanyId, location) => {
    const request = require('request');
    let oauthTokens = await quickbooksService.getAuthData(managementCompanyId);
    const ACCESS_TOKEN = oauthTokens[0].access_token;
    const COMPANY_ID = oauthTokens[0].realm_id;

    const headers = {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
    const data = {
        "BillAddr": {
            "Line1": location.billing_street_number + " " + location.billing_street_name,
            "City": location.billing_suburb,
            "Country": "Australia",
            "CountrySubDivisionCode": location.billing_state,
            "PostalCode": location.billing_postal_code
        },
        "Notes": "Here are other details.",
        "DisplayName": location.name,
        "PrimaryPhone": {
            "FreeFormNumber": location.telephone_number
        },
        "PrimaryEmailAddr": {
            "Address": location.email
        }
    }

    return new Promise((resolve, reject) => {
        request({
            headers: headers,
            uri: `https://quickbooks.api.intuit.com/v3/company/${COMPANY_ID}/customer?minorversion=12&type=json&Accept=application/json`,
            method: 'POST',
            json: data
        }, function (err, ress, body) {
            if (body.Fault && body.Fault.Error) {
                console.log(body.Fault.Error)
                reject(JSON.stringify(body.Fault.Error));
            }
            console.log(body)
            resolve(body);
        });
    });
}

let startCreateInvoice = async () => {
    console.log("-------- Start Creating Invoice", new Date())
    let prices = await billingService.getPricing();
    let management_company = await billingService.getManagementCompany();
    for (let m = 0; m < management_company.length; m++) {
        let managementCompanyId = management_company[m].id;
        let isRefreshToken = getRefreshToken(managementCompanyId);
        if (isRefreshToken) {
            let rate = await billingService.getRate(managementCompanyId, prices);
            if (rate !== undefined) {
                let locations = await billingService.getNumberOfSpacePerLocation(managementCompanyId);
                let companies = locations.filter((thing, index, self) =>
                    index === self.findIndex((t) => (
                        t.id === thing.id
                    ))
                );
                for (let c = 0; c < companies.length; c++) {
                    let customer = await billingService.getCustomer(companies[c].id);
                    let customerId = null;
                    if (customer[0] && customer[0].customer_ref_id) {
                        customerId = customer[0].customer_ref_id;
                    } else {
                        try {
                            let quickBooksCustomer = await createCustomer(managementCompanyId, companies[c]);
                            customerId = quickBooksCustomer.Customer.Id;
                        } catch (e) {
                        }

                        if (customer[0]) {
                            await billingService.updateCustomer(customerId, companies[c].id);
                        } else {
                            await billingService.createCustomer(customerId, companies[c].id);
                        }
                    }

                    let companyLocation = locations.filter((location) => location.id === companies[c].id);

                    for (let l = 0; l < companyLocation.length; l++) {
                        let spaceCount = companyLocation[l].space_count;
                        if (spaceCount > 0) {
                            let invoice = await createInvoice(managementCompanyId, companyLocation[l], customerId, rate, spaceCount);
                            await billingService.createInvoiceDueDate(invoice.Invoice.Id, invoice.Invoice.DueDate, companyLocation[l].location_id);
                            await billingService.updateNextInvoiceDate(companyLocation[l].location_id);
                        }
                    }
                }
            }
        }
    }
}

let checkInvoiceDueDate = async () => {
    console.log("-------- Checking Invoice Due Date", new Date())
    let management_company = await billingService.getManagementCompany();
    for (let m = 0; m < management_company.length; m++) {
        let managementCompanyId = management_company[m].id;
        let isRefreshToken = getRefreshToken(managementCompanyId);
        if (isRefreshToken) {
            let invoiceDueDates = await billingService.getInvoiceDueDate(managementCompanyId);
            for (let i = 0; i < invoiceDueDates.length; i++) {
                let invoiceId = invoiceDueDates[i].invoice_id;
                let invoice = await getInvoice(managementCompanyId, invoiceId);
                let suspended = invoiceDueDates[i].suspended == 1;
                let locationId = invoiceDueDates[i].location_id;
                if (invoice.Invoice.Balance === 0) {
                    await billingService.updateInvoicePaymentStatus("Paid", invoice.Invoice.DueDate, invoice.Invoice.Id, locationId);
                } else if (invoice.Invoice.Balance !== 0) {
                    await billingService.updateInvoicePaymentStatus(suspended ? "Suspended" : "Over Due", invoice.Invoice.DueDate, invoice.Invoice.Id, locationId);
                }
            }
        }
    }
}

let checkLocationPaymentStatus = async () => {
    console.log("-------- Checking Location Payment Status", new Date())
    let management_company = await billingService.getManagementCompany();
    for (let m = 0; m < management_company.length; m++) {
        let managementCompanyId = management_company[m].id;
        let isRefreshToken = getRefreshToken(managementCompanyId);
        if (isRefreshToken) {
            let getInvoicePaymentStatus = await billingService.getInvoicePaymentStatus(managementCompanyId);
            for (let i = 0; i < getInvoicePaymentStatus.length; i++) {
                let locationId = getInvoicePaymentStatus[i].location_id;
                let status = getInvoicePaymentStatus[i].status;
                let invoiceDueDate = getInvoicePaymentStatus[i].invoice_due_date;
                await billingService.updateLocationPaymentStatus(status, invoiceDueDate, locationId);
            }
        }
    }
}
// start()
module.exports = {startCreateInvoice, checkInvoiceDueDate, checkLocationPaymentStatus}
