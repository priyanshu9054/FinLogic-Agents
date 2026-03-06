import re
import uuid
from datetime import datetime
from typing import Dict, Any
import logging
from storage import upload_file
from database import dynamodb
from config import DYNAMO_KIRANAS_TABLE

logger = logging.getLogger(__name__)

# State code mapping (first 2 digits of GST)
STATE_CODES = {
    "01": "Jammu and Kashmir",
    "02": "Himachal Pradesh",
    "03": "Punjab",
    "04": "Chandigarh",
    "05": "Uttarakhand",
    "06": "Haryana",
    "07": "Delhi",
    "08": "Rajasthan",
    "09": "Uttar Pradesh",
    "10": "Bihar",
    "11": "Sikkim",
    "12": "Arunachal Pradesh",
    "13": "Nagaland",
    "14": "Manipur",
    "15": "Mizoram",
    "16": "Tripura",
    "17": "Meghalaya",
    "18": "Assam",
    "19": "West Bengal",
    "20": "Jharkhand",
    "21": "Odisha",
    "22": "Chhattisgarh",
    "23": "Madhya Pradesh",
    "24": "Gujarat",
    "25": "Daman and Diu",
    "26": "Dadra and Nagar Haveli",
    "27": "Maharashtra",
    "28": "Andhra Pradesh",
    "29": "Karnataka",
    "30": "Goa",
    "31": "Lakshadweep",
    "32": "Kerala",
    "33": "Tamil Nadu",
    "34": "Puducherry",
    "35": "Andaman and Nicobar Islands",
    "36": "Telangana",
    "37": "Andhra Pradesh",
}


def validate_gst_format(gst_number: str) -> bool:
    """
    Validate GST number format.

    Format: 15 characters
    - First 2 chars: State code (01-37)
    - Next 10 chars: PAN format (5 letters, 4 digits, 1 letter)
    - Last 3 chars: Alphanumeric

    Example: 27AABCU9603R1ZX
    """
    if len(gst_number) != 15:
        return False

    # Check state code (first 2 chars must be digits 01-37)
    state_code = gst_number[:2]
    if not state_code.isdigit() or state_code not in STATE_CODES:
        return False

    # Check PAN format (next 10 chars)
    pan_part = gst_number[2:12]
    # PAN format: 5 letters, 4 digits, 1 letter
    if not (
        pan_part[:5].isalpha() and pan_part[5:9].isdigit() and pan_part[9].isalpha()
    ):
        return False

    # Last 3 chars should be alphanumeric
    last_three = gst_number[12:]
    if not last_three.isalnum():
        return False

    return True


def get_mock_business_details(gst_number: str, store_name: str) -> Dict[str, Any]:
    """
    Generate mock business details for dummy government verification.
    """
    state_code = gst_number[:2]
    state = STATE_CODES.get(state_code, "Unknown")

    return {
        "business_name": store_name,
        "gst_status": "Active",
        "registration_date": "2020-01-15",
        "business_type": "Retail",
        "state": state,
    }


async def verify_gst(
    gst_number: str,
    store_name: str,
    location: str,
    owner_name: str,
    phone_number: str,
    file_content: bytes,
    filename: str,
) -> Dict[str, Any]:
    """
    Verify GST number and create kirana profile.

    Steps:
    1. Validate GST format
    2. Upload certificate to S3
    3. Perform dummy government verification
    4. Save kirana profile to DynamoDB
    5. Return verification result
    """

    # Step 1: Validate GST format
    if not validate_gst_format(gst_number):
        return {
            "kirana_id": None,
            "verified": False,
            "business_details": None,
            "message": "Invalid GST number format",
        }

    # Step 2: Upload GST certificate to S3
    s3_key = upload_file(
        file_content=file_content,
        folder="kiranas/gst-docs",
        filename=f"{gst_number}_{filename}",
    )

    if not s3_key:
        raise Exception("Failed to upload GST certificate to S3")

    # Step 3: Perform dummy government verification
    business_details = get_mock_business_details(gst_number, store_name)

    # Step 4: Generate unique kirana_id
    kirana_id = str(uuid.uuid4())

    # Step 5: Save to DynamoDB
    if dynamodb:
        try:
            table = dynamodb.Table(DYNAMO_KIRANAS_TABLE)
            table.put_item(
                Item={
                    "kirana_id": kirana_id,
                    "gst_number": gst_number,
                    "store_name": store_name,
                    "location": location,
                    "owner_name": owner_name,
                    "phone_number": phone_number,
                    "gst_certificate_s3_key": s3_key,
                    "verified": True,
                    "created_at": datetime.utcnow().isoformat(),
                    "business_details": business_details,
                }
            )
            logger.info(f"Kirana profile saved to DynamoDB: {kirana_id}")
        except Exception as e:
            logger.error(f"Failed to save to DynamoDB: {str(e)}")
            raise Exception(f"Failed to save kirana profile: {str(e)}")
    else:
        raise Exception("DynamoDB client not initialized")

    # Step 6: Return result
    return {
        "kirana_id": kirana_id,
        "verified": True,
        "business_details": business_details,
        "message": "GST verification successful",
    }
