import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({ region: 'eu-west-1' });
// s3.putObject

export default {
    putFile
}

async function putFile(inwestycjaId: string, ofertaId: string, nazwa: string, Body: AWS.S3.Body) {
    const Key = `${inwestycjaId}/${ofertaId}/${nazwa}`;
    return s3.putObject({ Bucket: 'nowydom', Key, Body }).promise();
}

// async function putFile(inwestycjaId: string, ofertaId: string, nazwa: string, Body: AWS.S3.Body) {
//     const Key = `${inwestycjaId}/${ofertaId}/${nazwa}`;
//     return s3.putObject({ Bucket: 'nowydom', Key, Body }).promise();
// }