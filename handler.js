'use strict';

const ContactsController = require('./controllers/ContactsController');
const FormsController = require('./controllers/FormsController');
const MailController = require('./controllers/MailController');
const SQSController = require('./controllers/SQSController');
const Contact = require('./db/Contact');
const Form = require('./db/Form');
const SQS = new SQSController(process.env.NOTIFICATIONS_QUEUE_URL);

const APIResponse = (body) => {
  return {
    statusCode: 200,
    body: JSON.stringify(body,null,2)
  };
}

const APIError = (code, error) => {
  return {
    statusCode: 200,
    body: JSON.stringify({error},null,2)
  };
}

const addForm = async (event) => {
  // TODO Protect this route with a key & get Company ID from Key
  // TODO Check Notification Email Format
  const Form = new FormsController("0");

  try {
    const _body = JSON.parse(event.body);
    if(!!_body.name && !!_body.primary_key && !!_body.notification_email) {
      const _result = await Form.add({
        name: _body.name,
        primary_key: _body.primary_key,
        notification_email: _body.notification_email,
        honeypot_key: !!_body.honeypot_key ? _body.honeypot_key : "none"
      });
      return APIResponse({
        result: _result
      });
    } else {
      throw new Error("Missing name, notification email, and/or primary key.");
    }
  } catch (e) {
    console.error(e);
    return APIError(500, e.message);
  }
}

const getFormToken = async (event) => {
  try {
    if(!!event.pathParameters && !!event.pathParameters.id) {
      const _result = await FormsController.getFormToken(event.pathParameters.id);
      return APIResponse({
        token: _result
      });
    } else {
      throw new Error("Please add a Form ID.");
    }
  } catch(e) {
    console.error(e);
    return APIError(500, e.message);
  }
}

const getForm = async (event) => {
  try {
    if(!!event.pathParameters && !!event.pathParameters.id) {
      const _result = await FormsController.get(event.pathParameters.id);
      console.log(_result);
      return APIResponse({
        result: _result
      });
    } else {
      throw new Error("Please add a Form ID.");
    }
  } catch(e) {
    console.error(e);
    return APIError(500, e.message);
  }
}

const addEntry = async (event) => {
  try {
    // Check for token
    if(!!!event.headers['Polymath-Form-Token']) {
      throw new Error("Missing Token in Header");
    }

    // Get IP for logging
    let _ip = null;
    if(!!event && !!event.requestContext && !!event.requestContext.identity && !!event.requestContext.identity.sourceIp) {
      _ip = event.requestContext.identity.sourceIp;
    }

    const Contact = new ContactsController({formToken: event.headers['Polymath-Form-Token']});
    const _body = JSON.parse(event.body);
    const _result = await Contact.add(_body, _ip);

    await SQS.add(_result);

    return APIResponse({
      result: _result
    });

  } catch(e) {
    console.error(e);
    return APIError(500, e.message);
  }
}

const getEntry = async (event) => {
  try {
    if(!!event.pathParameters && !!event.pathParameters.id) {
      const _result = await ContactsController.get(event.pathParameters.id);
      _result.data = JSON.parse(_result.data);
      return APIResponse({
        result: _result,
        event
      });
    } else {
      throw new Error("Please add a Contact ID.");
    }
  } catch(e) {
    console.error(e);
    return APIError(500, e.message);
  }
}

const contactNotification = require('./functions/contactNotification');

module.exports = {
  addForm,
  getFormToken,
  addEntry,
  contactNotification
}
