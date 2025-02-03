import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
});

export const uploadFile = async (req, res) => {

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `profile-pictures/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {

    const data = await s3.upload(params).promise();
    return { url: data.Location };

  } catch (error) {
    console.log(error.toString());
    throw error;
  }
};