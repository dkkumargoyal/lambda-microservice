'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);

    // validation
    if (typeof data.first_name !== 'string' || typeof data.last_name !== 'string') {
        console.error('Validation Failed');
        callback(null, {
            statusCode: 400,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: 'Couldn\'t update the user.',
        });
        return;
    }

    const params = {
        TableName: "users",
        Key: {
            id: event.pathParameters.id,
        },
        ExpressionAttributeValues: {
            ':first_name': data.first_name,
            ':last_name': data.last_name,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET first_name = :first_name, last_name = :last_name, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    // update the user in the database
    dynamoDb.update(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Couldn\'t fetch the user.',
            });
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Attributes),
        };
        callback(null, response);
    });
};
