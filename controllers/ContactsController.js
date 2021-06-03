const Dynamo = require('../db');
const uuid = require('uuid');
const TokenController = require('./TokenController');
const DB = new Dynamo();
const Token = new TokenController();

const FormsController = require('./FormsController');
const Util = require('./Util');

class ContactsController {

    constructor({formToken}) {
        this.formToken = formToken || null;
    }

    add(body, ip = null) {
        return new Promise(async (resolve, reject) => {
            try {
                delete body['Polymath-Form-Token'];
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

                // Check to see if email is valid.
                if(_form.primary_key == "email" || _form.primary_key.index_of('email') > -1) {
                    var _email = body[_form.primary_key];
                    if(!Util.validateEmail(_email)) {
                        throw new Error("Invalid email.");
                    }
                }
                _payload.primary_field = body[_form.primary_key];

                const _contact = new DB.Contact(_payload);

                // Check to make sure they didn't fill out a honeypot. if they did, swallow the exception
                if(_form.honeypot_key !== "none" && !!body[_form.honeypot_key]) {
                    return resolve({success: true});
                } else {
                    const _result = await _contact.save();
                    return resolve({success: true, _result});
                }

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