import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { nbfcAPI } from '../../api';
import { useNBFC } from '../../context/NBFCContext';

const NBFCRegister = () => {
    const navigate = useNavigate();
    const { updateNBFCData } = useNBFC();
    const [loading, setLoading] = useState(false);
    const [certificateFile, setCertificateFile] = useState(null);
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            minCreditScore: 700
        }
    });

    const regions = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'];
    const minCreditScore = watch('minCreditScore', 700);

    const onSubmit = async (data) => {
        // Validate certificate file
        if (!certificateFile) {
            toast.error('Please upload NBFC registration certificate');
            return;
        }

        setLoading(true);
        try {
            // Create FormData for multipart/form-data request
            const formData = new FormData();
            formData.append('nbfc_name', data.nbfcName);
            formData.append('rbi_license_number', data.rbiLicense);
            formData.append('contact_email', data.email);
            formData.append('contact_phone', data.phone);
            formData.append('loan_criteria', JSON.stringify({
                min_credit_score: parseInt(data.minCreditScore),
                max_loan_amount: parseInt(data.maxLoanAmount),
                min_loan_amount: parseInt(data.minLoanAmount),
                preferred_regions: data.preferredRegions || [],
                loan_tenure_months: parseInt(data.tenureMonths),
                interest_rate: parseFloat(data.interestRate),
            }));
            formData.append('registration_certificate', certificateFile);

            const response = await nbfcAPI.verifyNBFC(formData);

            // Check if verification was successful
            if (!response.data.verified) {
                toast.error(response.data.message || 'NBFC verification failed');
                return;
            }

            if (response.data.nbfc_id) {
                updateNBFCData({
                    nbfcId: response.data.nbfc_id,
                    nbfcName: data.nbfcName,
                });
                toast.success('NBFC registered successfully!');
                setTimeout(() => navigate('/nbfc/dashboard'), 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-bg-card rounded-2xl p-8 border border-gray-800">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">NBFC Registration</h1>
                    <p className="text-text-muted mb-8">Register your NBFC and set lending criteria</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* NBFC Details */}
                        <div className="border-b border-gray-700 pb-6">
                            <h2 className="text-lg font-heading font-bold text-white mb-4">NBFC Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">NBFC Name</label>
                                    <input
                                        {...register('nbfcName', { required: 'NBFC name is required' })}
                                        className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                        placeholder="QuickCapital NBFC"
                                    />
                                    {errors.nbfcName && <p className="text-red-400 text-sm mt-1">{errors.nbfcName.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">RBI License Number</label>
                                    <input
                                        {...register('rbiLicense', {
                                            required: 'RBI license is required',
                                            pattern: {
                                                value: /^N-[A-Za-z0-9.]{5,14}$/,
                                                message: 'Invalid format. Must start with N- (e.g., N-14.03296)'
                                            }
                                        })}
                                        className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                        placeholder="N-14.03296"
                                    />
                                    <p className="text-xs text-text-muted mt-1">Format: N-14.03296 (must start with N-)</p>
                                    {errors.rbiLicense && <p className="text-red-400 text-sm mt-1">{errors.rbiLicense.message}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Contact Email</label>
                                        <input
                                            {...register('email', { required: 'Email is required' })}
                                            type="email"
                                            className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                            placeholder="contact@nbfc.com"
                                        />
                                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Contact Phone</label>
                                        <input
                                            {...register('phone', { required: 'Phone is required' })}
                                            className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                            placeholder="9876543210"
                                        />
                                        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        <Upload className="inline w-4 h-4 mr-2" />
                                        NBFC Registration Certificate
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setCertificateFile(file);
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-90"
                                    />
                                    <p className="text-xs text-text-muted mt-1">Upload PDF, JPG, or PNG (Max 10MB)</p>
                                    {certificateFile && (
                                        <p className="text-sm text-green-400 mt-2">✓ {certificateFile.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Loan Criteria */}
                        <div>
                            <h2 className="text-lg font-heading font-bold text-white mb-4">Loan Criteria</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Minimum Credit Score: <span className="text-primary font-mono">{minCreditScore}</span>
                                    </label>
                                    <input
                                        {...register('minCreditScore', { required: true })}
                                        type="range"
                                        min="300"
                                        max="900"
                                        defaultValue="700"
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-text-muted mt-1">
                                        <span>300</span>
                                        <span>900</span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Min Loan Amount (₹)</label>
                                        <input
                                            {...register('minLoanAmount', { required: true })}
                                            type="number"
                                            className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                            placeholder="100000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Max Loan Amount (₹)</label>
                                        <input
                                            {...register('maxLoanAmount', { required: true })}
                                            type="number"
                                            className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                            placeholder="1000000"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Interest Rate (% p.a.)</label>
                                        <input
                                            {...register('interestRate', { required: true })}
                                            type="number"
                                            step="0.1"
                                            className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                            placeholder="14.5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Loan Tenure (months)</label>
                                        <input
                                            {...register('tenureMonths', { required: true })}
                                            type="number"
                                            className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                            placeholder="24"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Preferred Regions</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {regions.map((region) => (
                                            <label key={region} className="flex items-center space-x-2 text-white cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value={region}
                                                    {...register('preferredRegions')}
                                                    className="w-4 h-4 text-primary bg-bg-dark border-gray-700 rounded focus:ring-primary"
                                                />
                                                <span className="text-sm">{region}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            <span>{loading ? 'Registering...' : 'Register NBFC'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NBFCRegister;
