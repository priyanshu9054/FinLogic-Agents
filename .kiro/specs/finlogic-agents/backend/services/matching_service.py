from sqlalchemy.orm import Session
from models.score import Score
from database import dynamodb
from config import DYNAMO_NBFCS_TABLE
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class MatchingService:
    def __init__(self, db: Session):
        self.db = db
        self.nbfc_table = dynamodb.Table(DYNAMO_NBFCS_TABLE) if dynamodb else None

    def get_matched_nbfcs_for_kirana(self, kirana_id: str):
        """
        Get matched NBFCs for a Kirana based on credit score
        """
        # Get Kirana's credit score from database
        score_record = self.db.query(Score).filter(Score.kirana_id == kirana_id).first()

        if not score_record:
            return {
                "error": "Kirana not found or credit score not available",
                "kirana_id": kirana_id,
            }

        credit_score = score_record.credit_score
        loan_eligible_amount = score_record.loan_eligible_amount

        # Get all NBFCs from DynamoDB
        matched_nbfcs = []

        try:
            if self.nbfc_table:
                response = self.nbfc_table.scan()
                nbfcs = response.get("Items", [])

                # Match NBFCs based on criteria
                for nbfc in nbfcs:
                    loan_criteria = nbfc.get("loan_criteria", {})
                    min_credit_score = loan_criteria.get("min_credit_score", 0)

                    # Convert Decimal to float for JSON serialization
                    if isinstance(min_credit_score, Decimal):
                        min_credit_score = float(min_credit_score)

                    # Check if Kirana meets NBFC criteria
                    if credit_score >= min_credit_score:
                        min_amount = loan_criteria.get("min_loan_amount", 0)
                        max_amount = loan_criteria.get("max_loan_amount", 0)
                        interest_rate = loan_criteria.get("interest_rate", 0)
                        tenure_months = loan_criteria.get("max_tenure_months", 24)

                        # Convert Decimals to float
                        if isinstance(min_amount, Decimal):
                            min_amount = float(min_amount)
                        if isinstance(max_amount, Decimal):
                            max_amount = float(max_amount)
                        if isinstance(interest_rate, Decimal):
                            interest_rate = float(interest_rate)
                        if isinstance(tenure_months, Decimal):
                            tenure_months = int(tenure_months)

                        matched_nbfcs.append(
                            {
                                "nbfc_id": nbfc.get("nbfc_id"),
                                "nbfc_name": nbfc.get("nbfc_name"),
                                "min_loan_amount": min_amount,
                                "max_loan_amount": max_amount,
                                "interest_rate": interest_rate,
                                "tenure_months": tenure_months,
                                "min_credit_score": min_credit_score,
                            }
                        )
            else:
                logger.warning("DynamoDB table not initialized")

        except Exception as e:
            logger.error(f"Error fetching NBFCs: {str(e)}")
            return {"error": f"Failed to fetch NBFCs: {str(e)}", "kirana_id": kirana_id}

        return {
            "success": True,
            "kirana_id": kirana_id,
            "credit_score": credit_score,
            "nbfcs": matched_nbfcs,
        }

    def get_matched_kiranas_for_nbfc(self, nbfc_id: str):
        """
        Get matched Kiranas for an NBFC based on their criteria
        """
        # Get NBFC details from DynamoDB
        try:
            if not self.nbfc_table:
                logger.warning("DynamoDB table not initialized")
                return {"error": "NBFC service not available", "nbfc_id": nbfc_id}

            response = self.nbfc_table.get_item(Key={"nbfc_id": nbfc_id})
            nbfc = response.get("Item")

            if not nbfc:
                return {"error": "NBFC not found", "nbfc_id": nbfc_id}

            loan_criteria = nbfc.get("loan_criteria", {})
            min_credit_score = loan_criteria.get("min_credit_score", 0)

            if isinstance(min_credit_score, Decimal):
                min_credit_score = float(min_credit_score)

            # Get all Kiranas with scores that meet criteria
            score_records = (
                self.db.query(Score)
                .filter(Score.credit_score >= min_credit_score)
                .all()
            )

            matched_kiranas = []
            for score in score_records:
                # For demo purposes, we'll use placeholder data for store details
                # In production, you'd join with a Kirana table
                matched_kiranas.append(
                    {
                        "kirana_id": score.kirana_id,
                        "store_name": f"Store {score.kirana_id[:8]}",
                        "location": "Mumbai",  # Placeholder
                        "credit_score": score.credit_score,
                        "risk_level": score.risk_level,
                        "loan_eligible_amount": score.loan_eligible_amount,
                        "verified": True,
                    }
                )

            return {"nbfc_id": nbfc_id, "matched_kiranas": matched_kiranas}

        except Exception as e:
            logger.error(f"Error fetching matched Kiranas: {str(e)}")
            return {
                "error": f"Failed to fetch matched Kiranas: {str(e)}",
                "nbfc_id": nbfc_id,
            }
