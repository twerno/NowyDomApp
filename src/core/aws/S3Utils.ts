import awsConfig from '@src/config/awsConfig';
import * as AWS from 'aws-sdk';


const s3 = new AWS.S3({ region: awsConfig.region });

export default {
    putFile,
    fileExists
}

async function putFile(inwestycjaId: string, nazwa: string, Body: AWS.S3.Body, ContentType?: string) {
    const Key = `${inwestycjaId ? inwestycjaId + '/' : ''}${nazwa}`;
    return s3.putObject({ Bucket: awsConfig.Bucket, Key, Body, ContentType, ACL: 'public-read' }).promise();
}

async function fileExists(inwestycjaId: string, ofertaId: string, nazwa: string,) {
    const Key = `${inwestycjaId}/${ofertaId}/${nazwa}`;
    return s3.headObject({ Bucket: awsConfig.Bucket, Key })
        .promise()
        .then(v => true)
        .catch(e => false);
}
