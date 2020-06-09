import * as AWS from 'aws-sdk';

// TODO - wybadać: https://github.com/awslabs/dynamodb-data-mapper-js

const s3 = new AWS.S3({ region: 'eu-west-1' });

s3.putObject({ Bucket: 'autofinder', Key: 'text.txt', Body: 'test' }).promise();

// s3.putObject