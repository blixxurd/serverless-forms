const dynamoose = require('dynamoose');
const dynalite = require('dynalite');

class Models {

    constructor() {
        dynamoose.aws.sdk.config.update({
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET,
            region: process.env.REGION
        });
        this.Contact = require('./Contact')(dynamoose);
        this.Form = require('./Form')(dynamoose);
        this.Key = require('./Key')(dynamoose);
    }

    async local() {
        if(process.env.LOCAL_DB) {
            await dynalite().listen(8000);
            dynamoose.local();
        }
    }

}

module.exports = Models;