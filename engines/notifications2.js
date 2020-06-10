const cron = require("node-cron"),
    NotificationService = require('../services/notification/notification'),
    MeasureService = require('../services/measure/measure'),
    EmailService = require('../services/email/email');

// Parser function.
function parsePendingItemDetails(pendingItems) {

    let container = {};

    container['Due Soon'] = [];
    container['Overdue'] = [];

    if (pendingItems !== '') {

        pendingItems = pendingItems.split('<-->');

        if (pendingItems.length > 0) {
            for (let i in pendingItems) {
                const pendingItem = pendingItems[i].split('<->');

                const status = pendingItem[2];

                container[status].push({
                    name: pendingItem[1],
                    val: pendingItem[0],
                });
            }
        }
    }

    return container;
}

// I'll be back for you later.
async function processByManagementCompany (fn) {
    const managementCompanies = await NotificationService.getManagementCompanies();

    managementCompanies.forEach(async managementCompany => {
        const managementCompanyId = managementCompany['id'];

        if (typeof fn !== "undefined") {
            fn(managementCompanyId);
        }
    });
}

// Sending function.
async function sendComplianceNotification (userType) {

    const managementCompanies = await NotificationService.getManagementCompanies();

    // Send notifications per management company.
    managementCompanies.forEach(async managementCompany => {
        const managementCompanyId = managementCompany['id'];

        const complianceItemsOfConcern = await NotificationService.getPendingItemsPerManagementCompany(managementCompanyId, userType);

        // My query above, though empty - will always return a result.
        // Hence the need for these conditions below.
        const hasEntries = (
               complianceItemsOfConcern.length === 1
            && complianceItemsOfConcern[0]['emails'] === null
            && complianceItemsOfConcern[0]['items_of_concern'] === null
        ) === false;

        if (hasEntries && complianceItemsOfConcern.length !== 0) {

            for (let i in complianceItemsOfConcern) {
                const notification = complianceItemsOfConcern[i];

                const emails = notification['emails'];
                const notificationDetails = parsePendingItemDetails(notification['items_of_concern']);

                EmailService.sendItemNotificationEmail(
                    emails,
                    notificationDetails['Overdue'],
                    notificationDetails['Due Soon'],
                );
            }
        }
    });
}

function runCronJobForArchives() {
    // Run at 12am in every 1st of the month.
    cron.schedule('0 0 1 * *', () => {
        processByManagementCompany(async managementCompanyId => {
            let report = await MeasureService.getMyPortfolioReport(managementCompanyId);

            MeasureService.addReportToArchives(report, managementCompanyId);
        }, {
            scheduled: true,
            timezone: 'Australia/Melbourne',
        });
    });
}

function runCronJobForDueAndOverdueItems() {
    // Send every 4am in Melbourne's timezone.
    cron.schedule('0 4 * * *', () => {
        sendComplianceNotification('Administrator');
        sendComplianceNotification('Account Holder');
        sendComplianceNotification('Manager');
        sendComplianceNotification('Reviewer');
        sendComplianceNotification('Compliance Certifier');
    }, {
        scheduled: true,
        timezone: 'Australia/Melbourne',
    });
}

module.exports = {
    runCronJobForDueAndOverdueItems: runCronJobForDueAndOverdueItems,
    runCronJobForArchives: runCronJobForArchives,
    processByManagementCompany: processByManagementCompany,
};
