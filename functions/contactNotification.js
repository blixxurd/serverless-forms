const FormsController = require('../controllers/FormsController');
const fs = require('fs');
const Dynamo = require('../db');
const MailController = require('../controllers/MailController');
const Mailer = new MailController();
const DB = new Dynamo();

module.exports = async event => {
    const body = event.Records && event.Records[0] ? JSON.parse(event.Records[0].body) : undefined;

    try {
        const _form = await FormsController.get(body.form_id);
        if(!!!_form || !!!_form.notification_email || !!!_form.name) {
            console.log(_form);
            throw new Error("Form fields are broken.");
        }
        const _notification_email = _form.notification_email;
        const _data = JSON.parse(body.data);
        const _dataKeys = Object.keys(_data);
        const _tpl = fs.readFileSync('./tpl/form-submission.html', 'utf8');
        let _htmlData = "";

        for (let i = 0; i < _dataKeys.length; i++) {
            let key = _dataKeys[i];
            const val = _data[key];
            _htmlData += `<li style="margin-bottom: 10px;"><strong>${key}:</strong><br> ${val}</li>`;
        }

        const finalTPL = _tpl.replace('{{formname}}', _form.name).replace('{{dataTpl}}', _htmlData);

        const mail = await Mailer.sendHtmlEmail({
            to: _notification_email, 
            subject: `${_form.name} - New Website Form Submission`,
            html: finalTPL
        });

        // Send
        return {
            statusCode: 200,
            body: JSON.stringify(mail),
        };
    } catch(e) {
        throw new Error(e);
    }
};