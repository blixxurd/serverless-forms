// Load the SDK and UUID
var AWS = require('aws-sdk');

class SQSController {

    constructor(queueUrl, awsConfig = {region:'us-east-1'}) {
        AWS.config.update(awsConfig);
        this.SQS = new AWS.SQS({apiVersion: '2012-11-05'});
        this.queue = queueUrl;
    }

    _messageFromInfo(entry) {
        return {
            MessageBody: JSON.stringify(entry),
            QueueUrl: this.queue
        };
    }

    add(entry) {
        return new Promise((resolve, reject) => {
            let params = this._messageFromInfo(entry);
            this.SQS.sendMessage(params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }

}

module.exports = SQSController;