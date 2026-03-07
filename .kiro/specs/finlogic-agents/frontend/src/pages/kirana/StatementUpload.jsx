import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, CheckCircle, X } from 'lucide-react';
import { kiranaAPI } from '../../api';
import { useKirana } from '../../context/KiranaContext';

const StatementUpload = () => {
    const navigate = useNavigate();
    const { kiranaData, updateKiranaData } = useKirana();
    const [loading, setLoading] = useState(false);
    const [processingScore, setProcessingScore] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [bankStatement, setBankStatement] = useState(null);
    const [wholesalerInvoices, setWholesalerInvoices] = useState([]);

    const handleBankStatementChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setBankStatement(file);
            toast.success('Bank statement selected');
        } else {
            toast.error('Please upload a PDF file');
        }
    };

    const handleInvoiceChange = (e) => {
        const files = Array.from(e.target.files);
        const pdfFiles = files.filter(f => f.type === 'application/pdf');

        if (pdfFiles.length !== files.length) {
            toast.error('Only PDF files are allowed');
        }

        setWholesalerInvoices(prev => [...prev, ...pdfFiles]);
        toast.success(`${pdfFiles.length} invoice(s) added`);
    };

    const removeInvoice = (index) => {
        setWholesalerInvoices(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (!bankStatement) {
            toast.error('Please upload bank statement');
            return;
        }
        if (wholesalerInvoices.length === 0) {
            toast.error('Please upload at least one wholesaler invoice');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();

            // Use cached kirana_id from context or sessionStorage
            const kiranaIdToUse = kiranaData.kiranaId || sessionStorage.getItem('kirana_id');
            if (!kiranaIdToUse) {
                toast.error('Kirana ID not found. Please complete registration first.');
                setLoading(false);
                return;
            }

            formData.append('kirana_id', kiranaIdToUse);
            formData.append('bank_statement', bankStatement);

            wholesalerInvoices.forEach(invoice => {
                formData.append('wholesaler_invoices', invoice);
            });

            const response = await kiranaAPI.uploadStatement(formData);

            if (response.data) {
                setUploaded(true);
                toast.success('Documents uploaded and analyzed successfully!');

                // Automatically generate score after successful upload
                setTimeout(() => handleGenerateScore(), 1500);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateScore = async () => {
        setProcessingScore(true);
        try {
            // Use cached kirana_id from context or sessionStorage
            const kiranaIdToUse = kiranaData.kiranaId || sessionStorage.getItem('kirana_id');
            if (!kiranaIdToUse) {
                toast.error('Kirana ID not found. Please complete registration first.');
                setProcessingScore(false);
                return;
            }

            const response = await kiranaAPI.generateScore(kiranaIdToUse);

            if (response.data) {
                updateKiranaData({
                    creditScore: response.data.credit_score,
                    scoreBreakdown: response.data.score_breakdown || response.data.breakdown || {},
                    riskLevel: response.data.risk_level,
                    loanEligibleAmount: response.data.loan_eligible_amount,
                    recommendations: response.data.recommendations || [],
                });
                toast.success('Credit score generated!');
                setTimeout(() => navigate('/kirana/score'), 1000);
            }
        } catch (error) {
            console.error('Score generation error:', error);
            toast.error(error.response?.data?.message || 'Score generation failed.');
        } finally {
            setProcessingScore(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-bg-card rounded-2xl p-8 border border-gray-800">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Upload Financial Documents</h1>
                    <p className="text-text-muted mb-8">Upload your bank statement and invoices for credit analysis</p>

                    {(loading || processingScore) && (
                        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                            <div className="bg-bg-card rounded-2xl p-8 max-w-md w-full border border-gray-800 text-center">
                                <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                                <h2 className="text-2xl font-heading font-bold text-white mb-2">
                                    {loading ? 'Analyzing Documents...' : 'Generating Credit Score...'}
                                </h2>
                                <p className="text-text-muted">
                                    {loading
                                        ? 'Please wait while we process your financial documents'
                                        : 'Calculating your creditworthiness based on financial data'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Bank Statement */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Bank Statement (PDF)</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleBankStatementChange}
                                className="hidden"
                                id="bank-statement"
                                disabled={uploaded}
                            />
                            <label
                                htmlFor="bank-statement"
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer block ${uploaded
                                    ? 'border-green-500/30 bg-green-500/10 cursor-not-allowed'
                                    : 'border-gray-700 hover:border-primary'
                                    }`}
                            >
                                {bankStatement ? (
                                    <div className="flex items-center justify-center space-x-3">
                                        <FileText className="w-8 h-8 text-green-400" />
                                        <div className="text-left">
                                            <p className="text-white font-medium">{bankStatement.name}</p>
                                            <p className="text-sm text-text-muted">{(bankStatement.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                        {uploaded && <CheckCircle className="w-6 h-6 text-green-400" />}
                                    </div>
                                ) : (
                                    <>
                                        <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                        <p className="text-text-muted">Click to upload bank statement</p>
                                        <p className="text-sm text-text-muted mt-1">PDF up to 10MB</p>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* Wholesaler Invoices */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Wholesaler Invoices (PDF) - Multiple files allowed
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleInvoiceChange}
                                className="hidden"
                                id="wholesaler-invoices"
                                multiple
                                disabled={uploaded}
                            />
                            <label
                                htmlFor="wholesaler-invoices"
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer block ${uploaded
                                    ? 'border-green-500/30 bg-green-500/10 cursor-not-allowed'
                                    : 'border-gray-700 hover:border-primary'
                                    }`}
                            >
                                <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                <p className="text-text-muted">Click to upload invoices</p>
                                <p className="text-sm text-text-muted mt-1">PDF up to 10MB each</p>
                            </label>

                            {wholesalerInvoices.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {wholesalerInvoices.map((invoice, index) => (
                                        <div key={index} className="flex items-center justify-between bg-bg-dark rounded-lg p-3 border border-gray-700">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-5 h-5 text-secondary" />
                                                <div>
                                                    <p className="text-white text-sm font-medium">{invoice.name}</p>
                                                    <p className="text-xs text-text-muted">{(invoice.size / 1024).toFixed(2)} KB</p>
                                                </div>
                                            </div>
                                            {!uploaded && (
                                                <button
                                                    onClick={() => removeInvoice(index)}
                                                    className="text-red-400 hover:text-red-300 transition"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                            {uploaded && <CheckCircle className="w-5 h-5 text-green-400" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {!uploaded && (
                            <button
                                onClick={handleUpload}
                                disabled={loading || !bankStatement || wholesalerInvoices.length === 0}
                                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                <Upload className="w-5 h-5" />
                                <span>Upload & Analyze Documents</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatementUpload;
