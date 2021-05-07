module.exports = (dynamoose) => {
    return dynamoose.model(`${process.env.DYNAMO_TABLE_PREFIX}-Contacts`, {
        identifier: {
            type: String,
            required: true,
            hashKey: true
        },
        data: {
            type: String
        },
        primary_field: {
            type: String,
            required: true
        },
        form_id: {
            type: String,
            index: {
                name: "formIdIndex",
                global: true
            }
        },
        ip: {
            type: String
        }
    },
    {
        timestamps: true,
    },
    {
        throughput: "ON_DEMAND"
    });
}