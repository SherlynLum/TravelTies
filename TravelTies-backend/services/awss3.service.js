//load environment variables
require("dotenv").config();

const {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require("@aws-sdk/client-s3")
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner")
const {v4: uuidv4} = require('uuid');

// initialise s3
const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const generateUploadUrl = async (mimeType, folder) => {
    const extension = mimeType.split("/")[1];
    const name = uuidv4();
    const key = `${folder}/${name}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: mimeType
    })

    const url = await getSignedUrl(client, command, {expiresIn: 300});
    return {key, url}
}

const generateDisplayUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    })

    const url = await getSignedUrl(client, command, {expiresIn: 18000}); // expires in 5 hours
    return url;
}

const deleteObject = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });
    await client.send(command);
}

module.exports = {
    generateUploadUrl,
    generateDisplayUrl,
    deleteObject
};