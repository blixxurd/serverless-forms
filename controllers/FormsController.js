const Dynamo = require('../db');
const uuid = require('uuid');
const DB = new Dynamo();
const TokenController = require('./TokenController');
const Token = new TokenController();

class FormsController {

    constructor(owner = "0") {
        this.owner = owner;
    }

    add({name, primary_key, notification_email, honeypot_key}) {
        return new Promise(async (resolve, reject) => {
            const _payload = {
                identifier: uuid.v4(),
                primary_key,
                name,
                notification_email,
                honeypot_key,
                owner_id: this.owner
            };
            const _form = new DB.Form(_payload);
            console.log(_form);
            try {
                const _saved = await _form.save();
                return resolve(_saved);
            } catch(e) {
                return reject(e);
            }
        });
    }

    static get(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const _result = await DB.Form.query({"identifier": id}).exec();
                if(_result.length > 0) {
                    const _form = _result[0];
                    return resolve(_form);
                } else {
                    throw new Error("No form found with that ID.");
                }
            } catch (e) {
                return reject(e);
            }
        });
    }

    static getFormToken(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const _result = await DB.Form.query({"identifier": id}).exec();
                if(_result.length > 0) {
                    const _form = _result[0];
                    const _token = Token.create({form_id: _form.identifier});
                    return resolve(_token);
                } else {
                    throw new Error("No form found with that ID.");
                }
            } catch (e) {
                return reject(e);
            }
        });
    }


}

module.exports = FormsController;