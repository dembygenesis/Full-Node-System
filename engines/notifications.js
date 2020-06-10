// I am going to make a notifications service which houses all the functions.
// I choose to do this VS putting it in the respective object's service so I can easily trace it in one file.
// Disadvantages, when it scales - this function bloats. But I don't see myself working here that long.
// import '../../'

const cron = require("node-cron"),
      NotificationService = require('../services/notification/notification'),
      EmailService = require('../services/email/email');

// FUCK I have to rebuild this shit.

const parsePendingItemDetails = function(pendingItems) {

    let container = {};

    container['Due Soon'] = [];
    container['Overdue'] = [];

    if (pendingItems !== '') {

        console.log('splitting: ' + pendingItems);

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
};

module.exports  = class {
    // Change to timestamp.
    constructor(interval) {
        this.interval = interval;
    }

    parsePendingItemDetails(pendingItems) {

        let container = {};

        container['Due Soon'] = [];
        container['Overdue'] = [];

        if (pendingItems !== '') {

            console.log('splitting: ' + pendingItems);
            
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

    async sendComplianceNotification(userType) {

        console.log('Now running: ' + userType);
        
        const managementCompanies = await NotificationService.getManagementCompanies();

        // Send notifications per management company.
        managementCompanies.forEach(async managementCompany => {
            const managementCompanyId = managementCompany['id'];

            const complianceItemsOfConcern = await NotificationService.getPendingItemsPerManagementCompany(managementCompanyId, userType);

            // My query above, though empty - will always return a result.
            // Hence the need for these conditions below.
            const hasEntries = (complianceItemsOfConcern.length === 1
                && complianceItemsOfConcern[0]['emails'] === null
                && complianceItemsOfConcern[0]['items_of_concern'] === null) === false;

            console.log(complianceItemsOfConcern);
            
            if (hasEntries && complianceItemsOfConcern.length !== 0) {

                console.log('Go for: ' + JSON.stringify(complianceItemsOfConcern));
                
                for (let i in complianceItemsOfConcern) {
                    const notification = complianceItemsOfConcern[i];

                    const emails = notification['emails'];
                    console.log(this.parsePendingItemDetails);

                    // console.log('Will parse: ' + JSON.stringify(notification['items_of_concern']));
                    // console.log(this.parsePendingItemDetails);
                    // console.log(this.parsePendingItemDetails(notification['items_of_concern']));
                    
                    /*const notificationDetails = this.parsePendingItemDetails(notification['items_of_concern']);

                    EmailService.sendItemNotificationEmail(
                        emails,
                        notificationDetails['Overdue'],
                        notificationDetails['Due Soon'],
                    );*/
                }
            }
        });
    }

    runCronJobForDueAndOverdueItems(sendComplianceNotification) {
        // Send every 4am.

        const sendExpression = '42 14 * * *';
        const testSendExpression = '*/10 * * * * *';


        sendComplianceNotification('Administrator');
        sendComplianceNotification('Account Holder');

        /*cron.schedule(testSendExpression, function() {
            console.log('Hello');
            sendComplianceNotification('Administrator');
            /!*sendComplianceNotification('Administrator');
            sendComplianceNotification('Manager');
            sendComplianceNotification('Reviewer');
            sendComplianceNotification('Compliance Certifier');*!/
        }, {
            scheduled: true,
            // timezone: "Australia/Melbourne",
            timezone: "Asia/Singapore",
        });*/
    }

    async sendDailyNotificationsForDueAndOverdueItems() {
        // this.sendComplianceNotification('Administrator');
        this.runCronJobForDueAndOverdueItems(this.sendComplianceNotification);
    }
};