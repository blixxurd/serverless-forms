const Dynamo = require('../db');
const uuid = require('uuid');
const TokenController = require('./TokenController');
const DB = new Dynamo();
const Token = new TokenController();

const FormsController = require('./FormsController');

class ContactsController {

    constructor({formToken}) {
        this.formToken = formToken || null;
    }

    add(body, ip = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const tokenPayload = await Token.validate(this.formToken);
                this.formId = tokenPayload.form_id;
                
                const _form = await FormsController.get(this.formId);

                // Set up an empty payload 
                const _payload = {
                    identifier: uuid.v4(),
                    form_id: _form.identifier,
                    data: JSON.stringify(body)
                };

                // Log IP
                if(!!ip) {
                    _payload.ip = ip;
                }

                // Check to make sure form has the primary key.
                if(!!!_form.primary_key || !!!body[_form.primary_key]) {
                    throw new Error("Form does not include a primary field. Please review your markup.");
                }
                _payload.primary_field = body[_form.primary_key];

                // Check to make sure they didn't fill out a honeypot.
                if(_form.honeypot_key !== "none" && !!body[_form.honeypot_key]) {
                    throw new Error("Uh oh. Something went wrong.");
                }

                console.log(_payload);

                const _contact = new DB.Contact(_payload);
                const _result = _contact.save();
                return resolve(_result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static get(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const _result = await DB.Contact.query({"identifier": id}).exec();
                if(_result.length > 0) {
                    const _form = _result[0];
                    return resolve(_form);
                } else {
                    throw new Error("No contact found with that ID.");
                }
            } catch (e) {
                return reject(e);
            }
        });
    }


}

module.exports = ContactsController;