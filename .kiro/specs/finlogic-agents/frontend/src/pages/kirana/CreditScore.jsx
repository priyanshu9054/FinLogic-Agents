import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';
import { useKirana } from '../../context/KiranaContext';
import ScoreGauge from '../../components/common/ScoreGauge';
import StatusBadge from '../../components/common/StatusBadge';

const CreditScore = () => {
    const navigate = useNavigate();
    const { kiranaData } = useKirana();
    const { creditScore, scoreBreakdown, riskLevel, loanEligibleAmount, recommendations } = kiranaData;

    const getRiskLevel = (score) => {
        if (riskLevel) return riskLevel;
        if (score >= 750) return 'Low';
        if (score >= 600) return 'Medium';
        if (score >= 400) return 'High';
        return 'Very High';
    };

    const getEligibleAmount = (score) => {
        if (loanEligibleAmount) return loanEligibleAmount;
        if (score >= 750) return 500000;
        if (score >= 600) return 300000;
        if (score >= 400) return 150000;
        return 50000;
    };

    const defaultRecommendations = [
        'Maintain consistent monthly transactions',
        'Keep invoice matching above 80%',
        'Ensure regular purchases from wholesalers',
        'Maintain healthy bank balance',
    ];

    const displayRecommendations = recommendations && recommendations.length > 0
        ? recommendations
        : defaultRecommendations;

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-bg-card rounded-2xl p-8 border border-gray-800">
                    {/* Congratulations Banner */}
                    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6 mb-8 border border-primary/30">
                        <div className="flex items-center justify-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-primary" />
                            </div>
                            <h1 className="text-3xl font-heading font-bold text-white">Congratulations!</h1>
                        </div>
                        <p className="text-center text-white text-lg">Your credit score has been successfully generated</p>
                    </div>

                    <h2 className="text-2xl font-heading font-bold text-white mb-2 text-center">Your Credit Score</h2>
                    <p className="text-text-muted mb-8 text-center">Based on your financial analysis</p>

                    {/* Score Gauge */}
                    <div className="mb-12">
                        <ScoreGauge score={creditScore || 750} />
                    </div>

                    {/* Risk & Eligibility */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-bg-dark rounded-lg p-6">
                            <p className="text-text-muted text-sm mb-2">Risk Level</p>
                            <StatusBadge status={getRiskLevel(creditScore || 750)} />
                        </div>
                        <div className="bg-bg-dark rounded-lg p-6">
                            <p className="text-text-muted text-sm mb-2">Loan Eligible Amount</p>
                            <p className="text-3xl font-bold text-white font-mono">
                                ₹{getEligibleAmount(creditScore || 750).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="mb-8">
                        <h2 className="text-xl font-heading font-bold text-white mb-4">Score Breakdown</h2>
                        <div className="space-y-3">
                            {Object.entries(scoreBreakdown && Object.keys(scoreBreakdown).length > 0 ? scoreBreakdown : {
                                credit_consistency: 180,
                                purchase_regularity: 160,
                                invoice_match: 170,
                                balance_health: 150,
                                business_cycle: 90,
                            }).map(([key, value]) => {
                                const maxValue = key === 'business_cycle' ? 100 : 200;
                                const percentage = (value / maxValue) * 100;
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white capitalize">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-text-muted font-mono">{value} / {maxValue}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="mb-8">
                        <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-secondary" />
                            Recommendations to Improve Your Score
                        </h2>
                        <ul className="space-y-3">
                            {displayRecommendations.map((rec, i) => (
                                <li key={i} className="flex items-start space-x-3 text-text-muted bg-bg-dark rounded-lg p-3">
                                    <span className="text-secondary mt-1 text-lg">•</span>
                                    <span className="flex-1">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => navigate('/kirana/offers')}
                        className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center space-x-2"
                    >
                        <span>See Loan Offers</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreditScore;
