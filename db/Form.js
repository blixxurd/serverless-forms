module.exports = (dynamoose) => {
    return dynamoose.model(`${process.env.DYNAMO_TABLE_PREFIX}-Forms`, {
        identifier: {
            type: String,
            required: true,
            hashKey: true
        },
        primary_key: {
            type: String,
            required: true
        },
        honeypot_key: {
            type: String,
            required: false
        },
        name: {
            type: String,
            required: true
        },
        owner_id: {
            type: String,
            index: {
                name: "ownerIdIndex",
                global: true
            }
        },
        notification_email: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
        throughput: "ON_DEMAND"
    });
}