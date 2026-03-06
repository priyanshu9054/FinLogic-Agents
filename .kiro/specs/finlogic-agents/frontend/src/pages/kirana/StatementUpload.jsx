import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { kiranaAPI } from '../../api';
import { useKirana } from '../../context/KiranaContext';

const StatementUpload = () => {
    const navigate = useNavigate();
    const { kiranaData, updateKiranaData } = useKirana();
    const [loading, setLoading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [summary, setSummary] = useState(null);

    const handleUpload = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('kirana_id', kiranaData.kiranaId);

            const response = await kiranaAPI.uploadStatement(formData);
            if (response.data.success) {
                setSummary(response.data.summary);
                updateKiranaData({ statementSummary: response.data.summary });
                setUploaded(true);
                toast.success('Statement analyzed successfully!');
            }
        } catch (error) {
            toast.error('Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateScore = async () => {
        setLoading(true);
        try {
            const response = await kiranaAPI.generateScore(kiranaData.kiranaId);
            if (response.data.success) {
                updateKiranaData({
                    creditScore: response.data.credit_score,
                    scoreBreakdown: response.data.breakdown,
                });
                toast.success('Credit score generated!');
                navigate('/kirana/score');
            }
        } catch (error) {
            toast.error('Score generation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-bg-card rounded-2xl p-8 border border-gray-800">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Upload Financial Documents</h1>
                    <p className="text-text-muted mb-8">Upload your bank statement and invoices for credit analysis</p>

                    <div className="space-y-6">
                        {/* Bank Statement */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Bank Statement (PDF)</label>
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary transition cursor-pointer">
                                <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                <p className="text-text-muted">Click to upload bank statement</p>
                                <p className="text-sm text-text-muted mt-1">PDF up to 10MB</p>
                            </div>
                        </div>

                        {/* Wholesaler Invoice */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Wholesaler Invoice (PDF)</label>
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary transition cursor-pointer">
                                <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                <p className="text-text-muted">Click to upload invoices</p>
                                <p className="text-sm text-text-muted mt-1">PDF up to 10MB</p>
                            </div>
                        </div>

                        {!uploaded ? (
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                <Upload className="w-5 h-5" />
                                <span>{loading ? 'Analyzing...' : 'Upload & Analyze'}</span>
                            </button>
                        ) : (
                            <>
                                {/* Summary Card */}
                                <div className="bg-bg-dark rounded-lg p-6 border border-green-500/30">
                                    <div className="flex items-center space-x-2 text-green-400 mb-4">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Analysis Complete</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-text-muted text-sm">Total Credits</p>
                                            <p className="text-2xl font-bold text-white font-mono">₹{summary?.total_credits?.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-text-muted text-sm">Total Debits</p>
                                            <p className="text-2xl font-bold text-white font-mono">₹{summary?.total_debits?.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-text-muted text-sm">Months Analyzed</p>
                                            <p className="text-2xl font-bold text-white">{summary?.months_analyzed}</p>
                                        </div>
                                        <div>
                                            <p className="text-text-muted text-sm">Invoice Match</p>
                                            <p className="text-2xl font-bold text-white">{summary?.invoice_match}%</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerateScore}
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    <span>{loading ? 'Generating...' : 'Generate My Credit Score'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatementUpload;
