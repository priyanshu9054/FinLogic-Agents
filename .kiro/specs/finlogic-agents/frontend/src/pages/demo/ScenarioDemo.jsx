import { useState } from 'react';
import { CheckCircle, X, ArrowRight } from 'lucide-react';
import { mockKiranas, mockNBFCs } from '../../api/mockData';

const ScenarioDemo = () => {
    const [selectedKirana, setSelectedKirana] = useState(null);
    const [selectedNBFC, setSelectedNBFC] = useState(null);
    const [fundsAvailable, setFundsAvailable] = useState(true);
    const [result, setResult] = useState(null);

    const runScenario = () => {
        if (!selectedKirana || !selectedNBFC) {
            return;
        }

        const isMatch = selectedKirana.credit_score >= selectedNBFC.min_credit_score &&
            selectedKirana.loan_eligible_amount >= selectedNBFC.min_loan_amount;

        const canDisburse = isMatch && fundsAvailable;

        setResult({
            isMatch,
            canDisburse,
            reason: !isMatch
                ? `Credit score ${selectedKirana.credit_score} is below minimum ${selectedNBFC.min_credit_score}`
                : !fundsAvailable
                    ? 'Insufficient funds available'
                    : 'All criteria met - loan can be disbursed',
        });
    };

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-bg-card rounded-2xl p-8 border border-gray-800">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">🎮 Demo Scenario Controller</h1>
                    <p className="text-text-muted mb-8">Test different matching scenarios</p>

                    {/* Select Kirana */}
                    <div className="mb-8">
                        <h2 className="text-lg font-heading font-bold text-white mb-4">Select Kirana Store</h2>
                        <div className="space-y-3">
                            {mockKiranas.map((kirana) => (
                                <label
                                    key={kirana.kirana_id}
                                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition ${selectedKirana?.kirana_id === kirana.kirana_id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="kirana"
                                            checked={selectedKirana?.kirana_id === kirana.kirana_id}
                                            onChange={() => setSelectedKirana(kirana)}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <div>
                                            <p className="text-white font-medium">{kirana.store_name}</p>
                                            <p className="text-text-muted text-sm">{kirana.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-mono font-bold">Score: {kirana.credit_score}</p>
                                        <p className="text-text-muted text-sm">{kirana.risk_level} Risk</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Select NBFC */}
                    <div className="mb-8">
                        <h2 className="text-lg font-heading font-bold text-white mb-4">Select NBFC</h2>
                        <div className="space-y-3">
                            {mockNBFCs.map((nbfc) => (
                                <label
                                    key={nbfc.nbfc_id}
                                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition ${selectedNBFC?.nbfc_id === nbfc.nbfc_id
                                            ? 'border-secondary bg-secondary/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="nbfc"
                                            checked={selectedNBFC?.nbfc_id === nbfc.nbfc_id}
                                            onChange={() => setSelectedNBFC(nbfc)}
                                            className="w-4 h-4 text-secondary"
                                        />
                                        <div>
                                            <p className="text-white font-medium">{nbfc.nbfc_name}</p>
                                            <p className="text-text-muted text-sm">{nbfc.interest_rate}% p.a.</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-mono">Min Score: {nbfc.min_credit_score}</p>
                                        <p className="text-text-muted text-sm">
                                            ₹{(nbfc.min_loan_amount / 100000).toFixed(0)}L - ₹{(nbfc.max_loan_amount / 100000).toFixed(0)}L
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Funds Toggle */}
                    <div className="mb-8">
                        <h2 className="text-lg font-heading font-bold text-white mb-4">Fund Availability</h2>
                        <button
                            onClick={() => setFundsAvailable(!fundsAvailable)}
                            className={`w-full px-6 py-4 rounded-lg font-medium transition border-2 ${fundsAvailable
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}
                        >
                            {fundsAvailable ? '🟢 Funds Available' : '🔴 Funds Unavailable'}
                        </button>
                    </div>

                    {/* Run Button */}
                    <button
                        onClick={runScenario}
                        disabled={!selectedKirana || !selectedNBFC}
                        className="w-full px-6 py-4 bg-accent text-bg-dark rounded-lg font-bold text-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        <span>▶ Run This Scenario</span>
                        <ArrowRight className="w-6 h-6" />
                    </button>

                    {/* Result */}
                    {result && (
                        <div className={`mt-8 p-6 rounded-xl border-2 ${result.canDisburse
                                ? 'bg-green-500/10 border-green-500/30'
                                : result.isMatch
                                    ? 'bg-amber-500/10 border-amber-500/30'
                                    : 'bg-red-500/10 border-red-500/30'
                            }`}>
                            <div className="flex items-start space-x-4">
                                {result.canDisburse ? (
                                    <CheckCircle className="w-12 h-12 text-green-400 flex-shrink-0" />
                                ) : (
                                    <X className="w-12 h-12 text-red-400 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <h3 className={`text-2xl font-heading font-bold mb-2 ${result.canDisburse ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {result.canDisburse ? '✅ Match & Disburse' : result.isMatch ? '⚠️ Match but Cannot Disburse' : '❌ No Match'}
                                    </h3>
                                    <p className="text-white mb-4">{result.reason}</p>

                                    <div className="bg-bg-dark rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Kirana:</span>
                                            <span className="text-white font-medium">{selectedKirana.store_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Credit Score:</span>
                                            <span className="text-white font-mono font-bold">{selectedKirana.credit_score}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">NBFC:</span>
                                            <span className="text-white font-medium">{selectedNBFC.nbfc_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Min Required:</span>
                                            <span className="text-white font-mono font-bold">{selectedNBFC.min_credit_score}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Funds:</span>
                                            <span className={fundsAvailable ? 'text-green-400' : 'text-red-400'}>
                                                {fundsAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </div>
                                    </div>

                                    {result.canDisburse && (
                                        <div className="mt-4 p-4 bg-green-500/20 rounded-lg">
                                            <p className="text-green-400 font-medium">
                                                💰 Loan of ₹{selectedKirana.loan_eligible_amount.toLocaleString('en-IN')} can be disbursed at {selectedNBFC.interest_rate}% p.a. for {selectedNBFC.tenure_months} months
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScenarioDemo;
