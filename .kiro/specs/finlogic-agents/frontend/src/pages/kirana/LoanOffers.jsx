import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2, TrendingUp, Calendar, Percent, CheckCircle, Loader2 } from 'lucide-react';
import { kiranaAPI } from '../../api';
import { useKirana } from '../../context/KiranaContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LoanOffers = () => {
    const { kiranaData } = useKirana();
    const [nbfcs, setNbfcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNBFC, setSelectedNBFC] = useState(null);
    const [loanAmount, setLoanAmount] = useState('');
    const [requesting, setRequesting] = useState(false);
    const [requested, setRequested] = useState(false);

    useEffect(() => {
        loadNBFCs();
    }, []);

    const loadNBFCs = async () => {
        try {
            // Use cached kirana_id from context or sessionStorage
            const kiranaIdToUse = kiranaData.kiranaId || sessionStorage.getItem('kirana_id');
            if (!kiranaIdToUse) {
                toast.error('Kirana ID not found. Please complete registration first.');
                setLoading(false);
                return;
            }

            const response = await kiranaAPI.getMatchedNBFCs(kiranaIdToUse);
            if (response.data && response.data.nbfcs) {
                setNbfcs(response.data.nbfcs);
            } else if (response.data && Array.isArray(response.data)) {
                setNbfcs(response.data);
            }
        } catch (error) {
            console.error('Failed to load NBFCs:', error);
            toast.error(error.response?.data?.message || 'Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestLoan = async () => {
        const amount = parseFloat(loanAmount);

        // Validate amount is entered
        if (!loanAmount || isNaN(amount)) {
            toast.error('Please enter a valid loan amount');
            return;
        }

        // Check if amount is within NBFC range
        if (amount < selectedNBFC.min_loan_amount || amount > selectedNBFC.max_loan_amount) {
            toast.error(`Loan amount must be between ₹${selectedNBFC.min_loan_amount.toLocaleString('en-IN')} and ₹${selectedNBFC.max_loan_amount.toLocaleString('en-IN')}`);
            return;
        }

        setRequesting(true);
        try {
            // Use cached kirana_id from context or sessionStorage
            const kiranaIdToUse = kiranaData.kiranaId || sessionStorage.getItem('kirana_id');
            if (!kiranaIdToUse) {
                toast.error('Kirana ID not found. Please complete registration first.');
                setRequesting(false);
                return;
            }

            // Dummy validation: Check if amount is in range (already validated above)
            // In real scenario, this would be an API call
            const response = await kiranaAPI.requestLoan({
                kirana_id: kiranaIdToUse,
                nbfc_id: selectedNBFC.nbfc_id,
                amount: amount,
            });

            if (response.data.success) {
                setRequested(true);
                toast.success('Loan request sent successfully!');
                setTimeout(() => {
                    setSelectedNBFC(null);
                    setRequested(false);
                    setLoanAmount('');
                }, 3000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Request failed');
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-dark flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading loan offers..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-3xl font-heading font-bold text-white mb-2">Matched Loan Offers</h1>
                <p className="text-text-muted mb-8">NBFCs that match your credit profile</p>

                <div className="grid gap-6">
                    {nbfcs.map((nbfc) => (
                        <div key={nbfc.nbfc_id} className="bg-bg-card rounded-xl p-6 border border-gray-800 hover:border-primary transition">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-heading font-bold text-white">{nbfc.nbfc_name}</h3>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Matched
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                    <Percent className="w-4 h-4 text-text-muted" />
                                    <div>
                                        <p className="text-xs text-text-muted">Interest Rate</p>
                                        <p className="text-lg font-bold text-white">{nbfc.interest_rate}% p.a.</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-4 h-4 text-text-muted" />
                                    <div>
                                        <p className="text-xs text-text-muted">Loan Range</p>
                                        <p className="text-lg font-bold text-white font-mono">
                                            ₹{(nbfc.min_loan_amount / 100000).toFixed(0)}L - ₹{(nbfc.max_loan_amount / 100000).toFixed(0)}L
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-text-muted" />
                                    <div>
                                        <p className="text-xs text-text-muted">Tenure</p>
                                        <p className="text-lg font-bold text-white">{nbfc.tenure_months} months</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-text-muted" />
                                    <div>
                                        <p className="text-xs text-text-muted">Min Score</p>
                                        <p className="text-lg font-bold text-white">{nbfc.min_credit_score}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-bg-dark rounded-lg p-3 mb-4">
                                <p className="text-sm text-text-muted">
                                    <span className="text-green-400 font-medium">Match Reason:</span> Your score of {kiranaData.creditScore || 750} exceeds minimum {nbfc.min_credit_score}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedNBFC(nbfc)}
                                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition"
                            >
                                Request Loan
                            </button>
                        </div>
                    ))}
                </div>

                {/* Loan Request Modal */}
                {selectedNBFC && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-bg-card rounded-2xl p-8 max-w-md w-full border border-gray-800">
                            {!requested ? (
                                <>
                                    <h2 className="text-2xl font-heading font-bold text-white mb-4">
                                        Confirm Loan Request
                                    </h2>
                                    <p className="text-text-muted mb-6">
                                        Request loan from {selectedNBFC.nbfc_name}
                                    </p>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Loan Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(e.target.value)}
                                            className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                            placeholder={`${selectedNBFC.min_loan_amount} - ${selectedNBFC.max_loan_amount}`}
                                            min={selectedNBFC.min_loan_amount}
                                            max={selectedNBFC.max_loan_amount}
                                        />
                                        <p className="text-xs text-text-muted mt-1">
                                            Range: ₹{selectedNBFC.min_loan_amount.toLocaleString('en-IN')} - ₹{selectedNBFC.max_loan_amount.toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setSelectedNBFC(null)}
                                            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRequestLoan}
                                            disabled={requesting}
                                            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                                        >
                                            {requesting && <Loader2 className="w-5 h-5 animate-spin" />}
                                            <span>{requesting ? 'Sending...' : 'Submit'}</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-heading font-bold text-white mb-2">
                                        Request Sent!
                                    </h2>
                                    <p className="text-text-muted">
                                        NBFC will review and respond soon.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanOffers;
