import * as Minio from 'minio';
import fs from 'fs';

// Add error handling for missing environment variables
if (!process.env.MINIO_ENDPOINT) {
  throw new Error('MINIO_ENDPOINT environment variable is required');
}
if (!process.env.MINIO_ACCESS_KEY) {
  throw new Error('MINIO_ACCESS_KEY environment variable is required');
}
if (!process.env.MINIO_SECRET_KEY) {
  throw new Error('MINIO_SECRET_KEY environment variable is required');
}
if (!process.env.MINIO_PORT) {
  throw new Error('MINIO_PORT environment variable is required');
}
if (!process.env.MINIO_BUCKET_NAME) {
  throw new Error('MINIO_BUCKET_NAME environment variable is required');
}

const MinioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  port: parseInt(process.env.MINIO_PORT),
});

export const uploadFile = async (file, foldername, filename) => {
  // Generate unique filename using timestamp
  const uniqueFilename = `${foldername}/${filename}`;
  const buffer = fs.readFileSync(file.path);

  try {
    // Upload file to MinIO bucket
    await MinioClient.putObject(
      process.env.MINIO_BUCKET_NAME,
      uniqueFilename,
      buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    // Return the file URL
    return {
      filename: uniqueFilename,
    };
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

export const getFile = async (filename) => {
  try {
    // Get file from MinIO bucket as buffer
    const file = await MinioClient.getObject(
      process.env.MINIO_BUCKET_NAME,
      filename,
    );

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of file) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    throw new Error(`Error getting file: ${error.message}`);
  }
};
