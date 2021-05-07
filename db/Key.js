module.exports = (dynamoose) => {
    return dynamoose.model(`${process.env.DYNAMO_TABLE_PREFIX}-Keys`, {
        publish_key: {
            type: String,
            required: true,
            hashKey: true
        },
        read_key: {
            type: String,
            required: true,
            index: {
                name: "readKeyIndex",
                global: true
            }
        },
        owner_id: {
            type: String,
            index: {
                name: "ownerIdIndex",
                global: true
            }
        }
    },
    {
        timestamps: true,
        throughput: "ON_DEMAND"
    });
}