from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from services.gst_service import verify_gst
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gst", tags=["GST"])


@router.post("/verify")
async def verify_gst_endpoint(
    gst_number: str = Form(...),
    store_name: str = Form(...),
    location: str = Form(...),
    owner_name: str = Form(...),
    phone_number: str = Form(...),
    gst_certificate: UploadFile = File(...),
):
    """
    Verify GST number and create kirana profile.

    Args:
        gst_number: 15-character GST number
        store_name: Name of the store
        location: Store location
        owner_name: Owner's name
        phone_number: Contact phone number
        gst_certificate: GST certificate file (PDF or image)

    Returns:
        kirana_id: Unique identifier for the kirana
        verified: Boolean indicating verification status
        business_details: Business information from GST verification
        message: Status message
    """
    try:
        # Read file content
        file_content = await gst_certificate.read()

        # Call verification service
        result = await verify_gst(
            gst_number=gst_number,
            store_name=store_name,
            location=location,
            owner_name=owner_name,
            phone_number=phone_number,
            file_content=file_content,
            filename=gst_certificate.filename,
        )

        return result

    except Exception as e:
        logger.error(f"Error in GST verification endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
