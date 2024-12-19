# PocketHealth Interview

## Description

This project was created as a PocketHealth interview assignment

## Setup Instructions

1. Install dependencies

```bash
npm install
```

2. Create a .env file in the root directory with the following configuration

```
MINIO_ENDPOINT=localhost
MINIO_PORT=8001
MINIO_BUCKET_NAME=pockethealth
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password
```

3. First-time Setup:

- Login to the MinIO console. The console runs on port `8002` by default
- Create a bucket using the name specified in your `MINIO_BUCKET_NAME` environment variable

4. Configure MinIO

- Update the `start:minio` script in package.json to match your environment variables

## Running the Application

You can run the application in two modes:
Standard mode:
bash

```
npm run start
```

Debug mode:

```
npm run start:debug
```

## Environment Variables

| Variable          | Description                         |
| ----------------- | ----------------------------------- |
| MINIO_ENDPOINT    | MinIO server endpoint               |
| MINIO_PORT        | Port number for MinIO server        |
| MINIO_BUCKET_NAME | Name of the MinIO bucket            |
| MINIO_ACCESS_KEY  | Access key for MinIO authentication |
| MINIO_SECRET_KEY  | Secret key for MinIO authentication |

## Important Notes

- Ensure all environment variables are properly configured before running the application
- The MinIO bucket must be created manually on first run
- Make sure the MinIO server is running before starting the application
