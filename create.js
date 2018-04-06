'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);

    // input validations
    if (typeof data.first_name !== 'string' || typeof data.last_name !== 'string') {
        console.error('Validation Failed');
        callback(null, {
            statusCode: 400,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: 'Couldn\'t create the user.',
        });
        return;
    }

    // dynamo table input params
    const params = {
        TableName: "users",
        Item: {
            id: uuid.v1(),
            first_name: data.first_name,
            last_name: data.last_name,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    // write the user to the database
    dynamoDb.put(params, (error) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Couldn\'t create the user.',
            });
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            body: JSON.stringify(params.Item),
        };
        callback(null, response);
    });
};
