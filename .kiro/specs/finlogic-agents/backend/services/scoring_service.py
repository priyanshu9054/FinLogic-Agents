from sqlalchemy.orm import Session
from models.score import Score
from schemas.score import GenerateScoreResponse, ScoreBreakdown
import boto3
from decimal import Decimal
import statistics
from datetime import datetime, timedelta
from config import settings


class ScoringService:
    def __init__(self, db: Session):
        self.db = db
        self.dynamodb = boto3.resource(
            "dynamodb",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region,
        )
        self.statements_table = self.dynamodb.Table(settings.dynamo_statements_table)
        self.invoices_table = self.dynamodb.Table(settings.dynamo_invoices_table)

    def generate_score(self, kirana_id: str) -> GenerateScoreResponse:
        """Generate credit score for a kirana store based on their financial data"""

        # Fetch financial data
        statements = self._get_statements(kirana_id)
        invoices = self._get_invoices(kirana_id)

        # Calculate score components
        credit_consistency = self._calculate_credit_consistency(statements)
        purchase_regularity = self._calculate_purchase_regularity(invoices)
        invoice_match = self._calculate_invoice_match(statements, invoices)
        balance_health = self._calculate_balance_health(statements)
        business_cycle = self._calculate_business_cycle(statements, invoices)

        # Calculate total credit score
        credit_score = (
            credit_consistency
            + purchase_regularity
            + invoice_match
            + balance_health
            + business_cycle
            + 200  # Base score
        )

        # Ensure score is within valid range
        credit_score = max(300, min(900, credit_score))

        # Determine risk level
        risk_level = self._determine_risk_level(credit_score)

        # Calculate loan eligible amount
        loan_eligible_amount = self._calculate_loan_amount(credit_score, statements)

        # Generate recommendations
        recommendations = self._generate_recommendations(
            credit_score,
            credit_consistency,
            purchase_regularity,
            invoice_match,
            balance_health,
            business_cycle,
        )

        # Create score breakdown
        score_breakdown = ScoreBreakdown(
            credit_consistency=credit_consistency,
            purchase_regularity=purchase_regularity,
            invoice_match=invoice_match,
            balance_health=balance_health,
            business_cycle=business_cycle,
        )

        # Save to database
        score_record = Score(
            kirana_id=kirana_id,
            credit_score=credit_score,
            score_breakdown=score_breakdown.dict(),
            risk_level=risk_level,
            loan_eligible_amount=loan_eligible_amount,
            recommendations=recommendations,
        )
        self.db.add(score_record)
        self.db.commit()

        return GenerateScoreResponse(
            kirana_id=kirana_id,
            credit_score=credit_score,
            score_breakdown=score_breakdown,
            risk_level=risk_level,
            loan_eligible_amount=loan_eligible_amount,
            recommendations=recommendations,
            message="Score generated",
        )

    def _get_statements(self, kirana_id: str):
        """Fetch bank statements for the kirana"""
        try:
            response = self.statements_table.query(
                IndexName="kirana_id-index",
                KeyConditionExpression="kirana_id = :kid",
                ExpressionAttributeValues={":kid": kirana_id},
            )
            return response.get("Items", [])
        except Exception as e:
            print(f"Error fetching statements: {e}")
            return []

    def _get_invoices(self, kirana_id: str):
        """Fetch invoices for the kirana"""
        try:
            response = self.invoices_table.query(
                IndexName="kirana_id-index",
                KeyConditionExpression="kirana_id = :kid",
                ExpressionAttributeValues={":kid": kirana_id},
            )
            return response.get("Items", [])
        except Exception as e:
            print(f"Error fetching invoices: {e}")
            return []

    def _calculate_credit_consistency(self, statements) -> int:
        """Calculate credit consistency score (0-200)"""
        if not statements:
            return 100  # Default score

        # Analyze transaction patterns and consistency
        balances = [
            float(s.get("closing_balance", 0))
            for s in statements
            if "closing_balance" in s
        ]

        if len(balances) < 2:
            return 100

        # Calculate consistency based on balance stability
        avg_balance = statistics.mean(balances)
        std_dev = statistics.stdev(balances) if len(balances) > 1 else 0

        if avg_balance > 0:
            consistency_ratio = 1 - min(std_dev / avg_balance, 1)
            return int(consistency_ratio * 200)

        return 100

    def _calculate_purchase_regularity(self, invoices) -> int:
        """Calculate purchase regularity score (0-200)"""
        if not invoices:
            return 100  # Default score

        # Analyze purchase frequency and regularity
        if len(invoices) < 2:
            return 100

        # Calculate regularity based on invoice frequency
        dates = []
        for inv in invoices:
            if "invoice_date" in inv:
                try:
                    dates.append(datetime.fromisoformat(str(inv["invoice_date"])))
                except:
                    pass

        if len(dates) < 2:
            return 100

        dates.sort()
        intervals = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]

        if intervals:
            avg_interval = statistics.mean(intervals)
            std_interval = statistics.stdev(intervals) if len(intervals) > 1 else 0

            # More regular purchases = higher score
            if avg_interval > 0:
                regularity_ratio = 1 - min(std_interval / avg_interval, 1)
                return int(regularity_ratio * 200)

        return 100

    def _calculate_invoice_match(self, statements, invoices) -> int:
        """Calculate invoice matching score (0-200)"""
        if not statements or not invoices:
            return 100  # Default score

        # Analyze how well invoices match with bank statement transactions
        matched_count = 0
        total_invoices = len(invoices)

        # Simple matching logic - can be enhanced
        invoice_amounts = set()
        for inv in invoices:
            if "total_amount" in inv:
                invoice_amounts.add(float(inv["total_amount"]))

        statement_amounts = set()
        for stmt in statements:
            if "transactions" in stmt:
                for txn in stmt["transactions"]:
                    if "amount" in txn:
                        statement_amounts.add(abs(float(txn["amount"])))

        if invoice_amounts:
            matched_count = len(invoice_amounts.intersection(statement_amounts))
            match_ratio = matched_count / len(invoice_amounts)
            return int(match_ratio * 200)

        return 100

    def _calculate_balance_health(self, statements) -> int:
        """Calculate balance health score (0-200)"""
        if not statements:
            return 100  # Default score

        # Analyze balance trends and health
        balances = [
            float(s.get("closing_balance", 0))
            for s in statements
            if "closing_balance" in s
        ]

        if not balances:
            return 100

        avg_balance = statistics.mean(balances)
        min_balance = min(balances)

        # Positive balances and higher averages = better score
        if avg_balance > 50000:
            score = 200
        elif avg_balance > 25000:
            score = 150
        elif avg_balance > 10000:
            score = 120
        else:
            score = 80

        # Penalize if minimum balance is too low
        if min_balance < 0:
            score = int(score * 0.7)

        return min(200, score)

    def _calculate_business_cycle(self, statements, invoices) -> int:
        """Calculate business cycle score (0-100)"""
        if not statements and not invoices:
            return 50  # Default score

        # Analyze business cycle patterns
        total_transactions = sum(len(s.get("transactions", [])) for s in statements)
        total_invoices = len(invoices)

        # More activity = better business cycle
        activity_score = min(total_transactions + total_invoices, 100)

        return int(activity_score * 0.5) + 25  # Scale to 0-100 range

    def _determine_risk_level(self, credit_score: int) -> str:
        """Determine risk level based on credit score"""
        if credit_score >= 700:
            return "Low"
        elif credit_score >= 550:
            return "Medium"
        else:
            return "High"

    def _calculate_loan_amount(self, credit_score: int, statements) -> float:
        """Calculate eligible loan amount"""
        # Base loan amount on credit score
        if credit_score >= 750:
            base_amount = 500000
        elif credit_score >= 650:
            base_amount = 300000
        elif credit_score >= 550:
            base_amount = 150000
        else:
            base_amount = 50000

        # Adjust based on average balance
        if statements:
            balances = [
                float(s.get("closing_balance", 0))
                for s in statements
                if "closing_balance" in s
            ]
            if balances:
                avg_balance = statistics.mean(balances)
                # Loan amount can be up to 10x average balance
                balance_based_amount = avg_balance * 10
                return min(base_amount, balance_based_amount)

        return base_amount

    def _generate_recommendations(
        self,
        credit_score: int,
        credit_consistency: int,
        purchase_regularity: int,
        invoice_match: int,
        balance_health: int,
        business_cycle: int,
    ) -> list:
        """Generate personalized recommendations"""
        recommendations = []

        if credit_score < 650:
            recommendations.append(
                "Focus on maintaining consistent positive balances to improve creditworthiness"
            )

        if credit_consistency < 120:
            recommendations.append(
                "Work on stabilizing your cash flow by maintaining regular transaction patterns"
            )

        if purchase_regularity < 120:
            recommendations.append(
                "Establish regular purchase cycles with your suppliers to demonstrate business stability"
            )

        if invoice_match < 120:
            recommendations.append(
                "Ensure all supplier invoices are properly recorded and matched with bank transactions"
            )

        if balance_health < 120:
            recommendations.append(
                "Maintain higher average account balances to improve financial health indicators"
            )

        if business_cycle < 60:
            recommendations.append(
                "Increase business activity and transaction volume to demonstrate active operations"
            )

        if credit_score >= 700:
            recommendations.append(
                "Excellent credit profile! You qualify for premium loan products with favorable terms"
            )

        if not recommendations:
            recommendations.append(
                "Continue maintaining your current financial practices"
            )

        return recommendations
