import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from config import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize S3 client
try:
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION,
    )
except Exception as e:
    logger.error(f"Failed to initialize S3 client: {str(e)}")
    s3_client = None


def upload_file(file_content, folder, filename):
    """
    Upload file to S3 bucket.

    Args:
        file_content: File content (bytes or file-like object)
        folder: Folder path in S3 bucket
        filename: Name of the file

    Returns:
        str: S3 key of uploaded file, or None if upload fails
    """
    if not s3_client:
        logger.error("S3 client not initialized")
        return None

    try:
        s3_key = f"{folder}/{filename}" if folder else filename
        s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=s3_key, Body=file_content)
        logger.info(f"File uploaded successfully: {s3_key}")
        return s3_key
    except NoCredentialsError:
        logger.error("AWS credentials not found")
        return None
    except ClientError as e:
        logger.error(f"Failed to upload file: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during upload: {str(e)}")
        return None


def get_file(s3_key):
    """
    Download file from S3 bucket.

    Args:
        s3_key: S3 key of the file to download

    Returns:
        bytes: File content, or None if download fails
    """
    if not s3_client:
        logger.error("S3 client not initialized")
        return None

    try:
        response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
        file_content = response["Body"].read()
        logger.info(f"File downloaded successfully: {s3_key}")
        return file_content
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            logger.error(f"File not found: {s3_key}")
        else:
            logger.error(f"Failed to download file: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during download: {str(e)}")
        return None


def get_file_url(s3_key):
    """
    Generate presigned URL for S3 file.

    Args:
        s3_key: S3 key of the file

    Returns:
        str: Presigned URL valid for 1 hour, or None if generation fails
    """
    if not s3_client:
        logger.error("S3 client not initialized")
        return None

    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET_NAME, "Key": s3_key},
            ExpiresIn=3600,  # 1 hour
        )
        logger.info(f"Presigned URL generated for: {s3_key}")
        return url
    except ClientError as e:
        logger.error(f"Failed to generate presigned URL: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error generating URL: {str(e)}")
        return None
