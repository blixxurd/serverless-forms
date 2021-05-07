class MailController {

    constructor() {
        this.from = process.env.EMAIL_FROM;
        this.mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});
        this.mailComposer = require('nodemailer/lib/mail-composer');
    }

    sendHtmlEmail({to, subject, html}) {
        return new Promise((resolve, reject) => {
            const mail = new this.mailComposer({from: this.from, to, subject, html});
            mail.compile().build((err, message) => {
                if(!!err) {
                    console.log("Compile error");
                    return reject(err);
                }
                console.log("Compiled message.");
                var dataToSend = {to,message: message.toString('ascii')};
                console.log(dataToSend);
                this.mailgun.messages().sendMime(dataToSend, (sendError, body) => {
                    if (sendError) {
                        return reject(sendError);
                    }
                    return resolve(body);
                });
            });
        });
    }

}

module.exports = MailController;