import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({ region: 'eu-west-1' });

export default {
    putFile,
    fileExists
}

async function putFile(inwestycjaId: string, ofertaId: string, nazwa: string, Body: AWS.S3.Body) {
    const Key = `${inwestycjaId}/${ofertaId}/${nazwa}`;
    return s3.putObject({ Bucket: 'nowydom', Key, Body }).promise();
}

async function fileExists(inwestycjaId: string, ofertaId: string, nazwa: string, ) {
    const Key = `${inwestycjaId}/${ofertaId}/${nazwa}`;
    return s3.headObject({ Bucket: 'nowydom', Key })
        .promise()
        .then(v => true)
        .catch(e => false);
}
