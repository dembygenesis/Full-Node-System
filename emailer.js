const nodemailer = require("nodemailer");

let smtpTransport = nodemailer.createTransport({
    host: 'cp-wc08.syd02.ds.network',
    port: 465,
    auth: {
        user: 'notification@compliancelinc.com.au',
        pass: 'ComplyKeith2019',
    }
});

smtpTransport.verify(function(error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

const mailOptions = {
    from: "notification@compliancelinc.com.au",
    to: 'david@webstepup.com.au',
    subject: "ComplianceLinc Account Created (no reply)",
    generateTextFromHTML: true,
    html: 'Hello'
};

// Send off email with config above...
smtpTransport.sendMail(mailOptions, (error, response) => {
    if (error) {
        console.log(error);
    } else {
        console.log(response);
    }
    smtpTransport.close();
});
