import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, Upload, Loader2 } from 'lucide-react';
import { useKirana } from '../../context/KiranaContext';

const KiranaKYC = () => {
    const navigate = useNavigate();
    const { updateKiranaData } = useKirana();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState({
        aadhaar: false,
        pan: false,
        selfie: false,
    });

    const simulateVerification = async (type) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setVerified(prev => ({ ...prev, [type]: true }));
        setLoading(false);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            updateKiranaData({ kycComplete: true });
            toast.success('🎉 KYC Complete! Your store is verified.');
            setTimeout(() => navigate('/kirana/upload'), 1500);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-bg-card rounded-2xl p-8 border border-gray-800">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">KYC Verification</h1>
                    <p className="text-text-muted mb-8">Complete verification in 3 simple steps</p>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-12">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${s <= step ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'
                                    }`}>
                                    {s < step || verified[['aadhaar', 'pan', 'selfie'][s - 1]] ? <CheckCircle className="w-6 h-6" /> : s}
                                </div>
                                {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-primary' : 'bg-gray-700'}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Aadhaar */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-heading font-bold text-white">Step 1: Aadhaar Verification</h2>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Aadhaar Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                    placeholder="1234 5678 9012"
                                    maxLength="12"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Upload Aadhaar Front</label>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary transition cursor-pointer">
                                    <Upload className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                    <p className="text-text-muted">Click to upload or drag and drop</p>
                                    <p className="text-sm text-text-muted mt-1">PNG, JPG up to 5MB</p>
                                </div>
                            </div>

                            {verified.aadhaar ? (
                                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-lg">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Aadhaar Verified</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => simulateVerification('aadhaar')}
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    <span>{loading ? 'Verifying...' : 'Verify Aadhaar'}</span>
                                </button>
                            )}

                            {verified.aadhaar && (
                                <button
                                    onClick={handleNext}
                                    className="w-full px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-opacity-90 transition"
                                >
                                    Next Step
                                </button>
                            )}
                        </div>
                    )}

                    {/* Step 2: PAN */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-heading font-bold text-white">Step 2: PAN Card Verification</h2>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">PAN Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                    placeholder="ABCDE1234F"
                                    maxLength="10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Upload PAN Card</label>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary transition cursor-pointer">
                                    <Upload className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                    <p className="text-text-muted">Click to upload or drag and drop</p>
                                    <p className="text-sm text-text-muted mt-1">PNG, JPG up to 5MB</p>
                                </div>
                            </div>

                            {verified.pan ? (
                                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-lg">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">PAN Verified</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => simulateVerification('pan')}
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    <span>{loading ? 'Verifying...' : 'Verify PAN'}</span>
                                </button>
                            )}

                            {verified.pan && (
                                <button
                                    onClick={handleNext}
                                    className="w-full px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-opacity-90 transition"
                                >
                                    Next Step
                                </button>
                            )}
                        </div>
                    )}

                    {/* Step 3: Selfie */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-heading font-bold text-white">Step 3: Live Photo Verification</h2>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Upload Selfie / Live Photo</label>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary transition cursor-pointer">
                                    <Upload className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                    <p className="text-text-muted">Click to upload or drag and drop</p>
                                    <p className="text-sm text-text-muted mt-1">PNG, JPG up to 5MB</p>
                                </div>
                            </div>

                            {verified.selfie ? (
                                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-lg">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Face Match Successful</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => simulateVerification('selfie')}
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    <span>{loading ? 'Verifying...' : 'Verify Photo'}</span>
                                </button>
                            )}

                            {verified.selfie && (
                                <button
                                    onClick={handleNext}
                                    className="w-full px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-opacity-90 transition"
                                >
                                    Complete KYC
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KiranaKYC;
