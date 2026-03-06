import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    # AWS Configuration
    aws_access_key_id: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    aws_secret_access_key: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    aws_region: str = os.getenv("AWS_REGION", "us-east-1")
    s3_bucket_name: str = os.getenv("S3_BUCKET_NAME", "")

    # DynamoDB Tables
    dynamo_kiranas_table: str = os.getenv("DYNAMO_KIRANAS_TABLE", "")
    dynamo_nbfcs_table: str = os.getenv("DYNAMO_NBFCS_TABLE", "")
    dynamo_statements_table: str = os.getenv("DYNAMO_STATEMENTS_TABLE", "")
    dynamo_matches_table: str = os.getenv("DYNAMO_MATCHES_TABLE", "")
    dynamo_invoices_table: str = os.getenv("DYNAMO_INVOICES_TABLE", "")

    # Google API
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")

    # Application Environment
    app_env: str = os.getenv("APP_ENV", "development")

    # Database URL (for SQLAlchemy if needed)
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./finlogic.db")

    class Config:
        env_file = ".env"


settings = Settings()

# Backward compatibility - expose as module-level variables
AWS_ACCESS_KEY_ID = settings.aws_access_key_id
AWS_SECRET_ACCESS_KEY = settings.aws_secret_access_key
AWS_REGION = settings.aws_region
S3_BUCKET_NAME = settings.s3_bucket_name
DYNAMO_KIRANAS_TABLE = settings.dynamo_kiranas_table
DYNAMO_NBFCS_TABLE = settings.dynamo_nbfcs_table
DYNAMO_STATEMENTS_TABLE = settings.dynamo_statements_table
DYNAMO_MATCHES_TABLE = settings.dynamo_matches_table
DYNAMO_INVOICES_TABLE = settings.dynamo_invoices_table
GOOGLE_API_KEY = settings.google_api_key
APP_ENV = settings.app_env
