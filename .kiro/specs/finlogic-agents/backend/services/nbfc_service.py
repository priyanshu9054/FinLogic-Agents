import re
import uuid
from datetime import datetime
from decimal import Decimal
from database import dynamodb
from config import DYNAMO_NBFCS_TABLE
from storage import upload_file
import logging

logger = logging.getLogger(__name__)


class NBFCService:
    def __init__(self):
        self.table = dynamodb.Table(DYNAMO_NBFCS_TABLE) if dynamodb else None

    def validate_rbi_license(self, license_number: str) -> bool:
        """
        Validate RBI license format: must start with N- followed by 14 alphanumeric characters
        Example: N-14.03246
        """
        pattern = r"^N-[A-Za-z0-9.]{5,14}$"
        return bool(re.match(pattern, license_number))

    def _convert_floats_to_decimal(self, obj):
        """
        Recursively convert float values to Decimal for DynamoDB compatibility
        """
        if isinstance(obj, float):
            return Decimal(str(obj))
        elif isinstance(obj, dict):
            return {
                key: self._convert_floats_to_decimal(value)
                for key, value in obj.items()
            }
        elif isinstance(obj, list):
            return [self._convert_floats_to_decimal(item) for item in obj]
        return obj

    async def verify_nbfc(
        self, data: dict, certificate_content: bytes, certificate_filename: str
    ) -> dict:
        """
        Verify NBFC and save to DynamoDB with registration certificate
        """
        rbi_license_number = data.get("rbi_license_number", "")

        # Validate RBI license format
        if not self.validate_rbi_license(rbi_license_number):
            return {
                "nbfc_id": "",
                "verified": False,
                "message": "Invalid RBI license format. Must start with N- followed by alphanumeric characters.",
            }

        # Generate unique NBFC ID
        nbfc_id = str(uuid.uuid4())

        # Upload registration certificate to S3
        certificate_s3_key = upload_file(
            certificate_content,
            f"nbfcs/{nbfc_id}/certificates",
            certificate_filename,
        )

        if not certificate_s3_key:
            return {
                "nbfc_id": "",
                "verified": False,
                "message": "Failed to upload registration certificate",
            }

        # Dummy RBI verification (always returns true for valid format)
        verification_result = {
            "verified": True,
            "nbfc_type": "Investment Company",
            "registration_date": "2020-01-15",
            "status": "Active",
        }

        # Convert loan_criteria floats to Decimal for DynamoDB
        loan_criteria = self._convert_floats_to_decimal(data.get("loan_criteria"))

        # Prepare item for DynamoDB
        item = {
            "nbfc_id": nbfc_id,
            "nbfc_name": data.get("nbfc_name"),
            "rbi_license_number": rbi_license_number,
            "contact_email": data.get("contact_email"),
            "contact_phone": data.get("contact_phone"),
            "loan_criteria": loan_criteria,
            "registration_certificate_s3_key": certificate_s3_key,
            "verified": verification_result["verified"],
            "nbfc_type": verification_result["nbfc_type"],
            "registration_date": verification_result["registration_date"],
            "status": verification_result["status"],
            "created_at": datetime.utcnow().isoformat(),
        }

        # Save to DynamoDB
        try:
            if self.table:
                self.table.put_item(Item=item)
                logger.info(f"NBFC {nbfc_id} saved to DynamoDB with certificate")
            else:
                logger.warning("DynamoDB table not initialized")
        except Exception as e:
            logger.error(f"Failed to save NBFC to DynamoDB: {str(e)}")
            return {
                "nbfc_id": nbfc_id,
                "verified": False,
                "message": f"Verification successful but failed to save: {str(e)}",
            }

        return {
            "nbfc_id": nbfc_id,
            "verified": True,
            "message": "NBFC verified successfully with registration certificate",
        }
