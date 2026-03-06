import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2, TrendingUp, Clock, CheckCircle, X } from 'lucide-react';
import { nbfcAPI } from '../../api';
import { useNBFC } from '../../context/NBFCContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NBFCDashboard = () => {
    const { nbfcData, updateNBFCData } = useNBFC();
    const [kiranas, setKiranas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKirana, setSelectedKirana] = useState(null);
    const [disbursing, setDisbursing] = useState(false);

    useEffect(() => {
        loadKiranas();
    }, []);

    const loadKiranas = async () => {
        try {
            const response = await nbfcAPI.getMatchedKiranas(nbfcData.nbfcId || 'nbfc-001');
            if (response.data.success) {
                setKiranas(response.data.kiranas);
            }
        } catch (error) {
            toast.error('Failed to load matches');
        } finally {
            setLoading(false);
        }
    };

    const handleDisburse = async (kirana) => {
        if (!nbfcData.fundsAvailable) {
            toast.error('❌ Insufficient Funds. Please top up.');
            return;
        }

        setDisbursing(true);
        try {
            const response = await nbfcAPI.disburseLoan({
                nbfc_id: nbfcData.nbfcId,
                kirana_id: kirana.kirana_id,
                amount: kirana.loan_eligible_amount,
            });

            if (response.data.success) {
                toast.success('✅ Disbursement Successful!');
                updateNBFCData({
                    fundsAmount: nbfcData.fundsAmount - kirana.loan_eligible_amount,
                });
                setSelectedKirana(null);
            }
        } catch (error) {
            toast.error('Disbursement failed');
        } finally {
            setDisbursing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-dark flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-heading font-bold text-white mb-8">NBFC Dashboard</h1>

                {/* Stats Bar */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-bg-card rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-text-muted text-sm">Matched Kiranas</p>
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold text-white">{kiranas.length}</p>
                    </div>

                    <div className="bg-bg-card rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-text-muted text-sm">Pending Requests</p>
                            <Clock className="w-5 h-5 text-accent" />
                        </div>
                        <p className="text-3xl font-bold text-white">1</p>
                    </div>

                    <div className="bg-bg-card rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-text-muted text-sm">Funds Available</p>
                            <TrendingUp className="w-5 h-5 text-secondary" />
                        </div>
                        <p className="text-3xl font-bold text-white font-mono">
                            ₹{(nbfcData.fundsAmount / 100000).toFixed(1)}L
                        </p>
                    </div>

                    <div className="bg-bg-card rounded-xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-text-muted text-sm">Disbursed</p>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-white font-mono">₹5L</p>
                    </div>
                </div>

                {/* Funds Toggle */}
                <div className="bg-bg-card rounded-xl p-6 border border-gray-800 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-white mb-1">Fund Availability</h3>
                            <p className="text-text-muted text-sm">Toggle for demo purposes</p>
                        </div>
                        <button
                            onClick={() => updateNBFCData({ fundsAvailable: !nbfcData.fundsAvailable })}
                            className={`px-6 py-3 rounded-lg font-medium transition ${nbfcData.fundsAvailable
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}
                        >
                            {nbfcData.fundsAvailable ? '🟢 Funds Available' : '🔴 Funds Unavailable'}
                        </button>
                    </div>
                </div>

                {/* Matched Kiranas Table */}
                <div className="bg-bg-card rounded-xl border border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-xl font-heading font-bold text-white">Matched Kiranas</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-bg-dark">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Store Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Risk</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Eligible</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {kiranas.map((kirana) => (
                                    <tr key={kirana.kirana_id} className="hover:bg-bg-dark/50 transition">
                                        <td className="px-6 py-4 text-white font-medium">{kirana.store_name}</td>
                                        <td className="px-6 py-4 text-text-muted">{kirana.location}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-white font-bold">{kirana.credit_score}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={kirana.risk_level} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-white">₹{(kirana.loan_eligible_amount / 100000).toFixed(1)}L</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={kirana.kirana_id === 'kirana-001' ? 'Request Received' : 'Matched'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedKirana(kirana)}
                                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition"
                                            >
                                                {kirana.kirana_id === 'kirana-001' ? 'Review Request' : 'View Details'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Review Modal */}
                {selectedKirana && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-bg-card rounded-2xl p-8 max-w-2xl w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-white mb-1">
                                        {selectedKirana.store_name}
                                    </h2>
                                    <p className="text-text-muted">{selectedKirana.location}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedKirana(null)}
                                    className="text-text-muted hover:text-white transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-bg-dark rounded-lg p-4">
                                    <p className="text-text-muted text-sm mb-1">Credit Score</p>
                                    <p className="text-3xl font-bold text-white font-mono">{selectedKirana.credit_score}</p>
                                </div>
                                <div className="bg-bg-dark rounded-lg p-4">
                                    <p className="text-text-muted text-sm mb-1">Risk Level</p>
                                    <StatusBadge status={selectedKirana.risk_level} />
                                </div>
                                <div className="bg-bg-dark rounded-lg p-4">
                                    <p className="text-text-muted text-sm mb-1">Eligible Amount</p>
                                    <p className="text-2xl font-bold text-white font-mono">
                                        ₹{selectedKirana.loan_eligible_amount.toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="bg-bg-dark rounded-lg p-4">
                                    <p className="text-text-muted text-sm mb-1">KYC Status</p>
                                    <StatusBadge status="Verified" />
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setSelectedKirana(null)}
                                    className="flex-1 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30 transition"
                                >
                                    ❌ Reject
                                </button>
                                <button
                                    onClick={() => handleDisburse(selectedKirana)}
                                    disabled={disbursing}
                                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
                                >
                                    {disbursing ? 'Processing...' : '✅ Approve & Disburse'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NBFCDashboard;
