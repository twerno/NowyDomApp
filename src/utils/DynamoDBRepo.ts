import * as AWS from 'aws-sdk';
import { CredentialProviderChain, SharedIniFileCredentials } from 'aws-sdk';
import { IStringMap } from './IMap';

// TODO - wybadać: https://github.com/awslabs/dynamodb-data-mapper-js

const db = new AWS.DynamoDB.DocumentClient(
    {
        region: 'eu-west-1',
        credentialProvider: new CredentialProviderChain([
            function () {
                return new AWS.SharedIniFileCredentials({
                    disableAssumeRole: true,
                    callback: (err) => console.error(err)
                });
            }
        ])
    }
);

export class DynamoDBRepo<Key extends IStringMap<any>, T extends Key> {

    public constructor(
        public readonly tableName: string,
        public readonly partitionKey: string) {
    }

    public async put(item: T) {
        return db.put({
            Item: item,
            TableName: this.tableName
        }).promise();
    }

    public async getOne(key: NonNullable<Key>): Promise<T> {
        return db.get({
            TableName: this.tableName,
            Key: key
        }).promise()
            .then(val => val.Item as T);
    }

    public async delete(key: NonNullable<Key>) {
        return db.delete({
            TableName: this.tableName,
            Key: key
        }).promise();
    }

    public async scan(): Promise<T[]> {
        return db.scan({
            TableName: this.tableName
        }).promise()
            .then(val => val.Items as T[]);
    }

    public async queryByPartitionKey(key: string): Promise<T[]> {
        return db
            .query({
                TableName: this.tableName,
                KeyConditionExpression: "#partitionKey = :partitionKey",
                ExpressionAttributeNames: {
                    '#partitionKey': this.partitionKey,
                },
                ExpressionAttributeValues: {
                    ':partitionKey': key,
                },
            })
            .promise()
            .then(val => val.Items as any || [])
            .catch(err => {
                console.error(err);
                return [];
            });
    }

    public async batchPut(items: T[]) {
        const RequestItems = { '000': items };
        return db
            .batchWrite(({ RequestItems }))
            .promise();
    }

}

