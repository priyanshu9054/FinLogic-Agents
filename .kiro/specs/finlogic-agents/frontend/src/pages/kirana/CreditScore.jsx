import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useKirana } from '../../context/KiranaContext';
import ScoreGauge from '../../components/common/ScoreGauge';
import StatusBadge from '../../components/common/StatusBadge';

const CreditScore = () => {
    const navigate = useNavigate();
    const { kiranaData } = useKirana();
    const { creditScore, scoreBreakdown } = kiranaData;

    const getRiskLevel = (score) => {
        if (score >= 750) return 'Low';
        if (score >= 600) return 'Medium';
        if (score >= 400) return 'High';
        return 'Very High';
    };

    const getEligibleAmount = (score) => {
        if (score >= 750) return 500000;
        if (score >= 600) return 300000;
        if (score >= 400) return 150000;
        return 50000;
    };

    const recommendations = [
        'Maintain consistent monthly transactions',
        'Keep invoice matching above 80%',
        'Ensure regular purchases from wholesalers',
        'Maintain healthy bank balance',
    ];

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-bg-card rounded-2xl p-8 border border-gray-800">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Your Credit Score</h1>
                    <p className="text-text-muted mb-8">Based on your financial analysis</p>

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
                            {Object.entries(scoreBreakdown || {
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
                            Recommendations
                        </h2>
                        <ul className="space-y-2">
                            {recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start space-x-2 text-text-muted">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>{rec}</span>
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
