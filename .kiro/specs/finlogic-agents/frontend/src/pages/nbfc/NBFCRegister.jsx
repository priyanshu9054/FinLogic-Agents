import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { nbfcAPI } from '../../api';
import { useNBFC } from '../../context/NBFCContext';

const NBFCRegister = () => {
    const navigate = useNavigate();
    const { updateNBFCData } = useNBFC();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            minCreditScore: 700
        }
    });

    console.log('🎨 NBFCRegister component rendered');

    const regions = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'];
    const minCreditScore = watch('minCreditScore', 700);

    const onSubmit = async (data) => {
        console.log('🚀 Form submitted with data:', data);
        setLoading(true);
        try {
            // Transform data to match backend schema
            const payload = {
                nbfc_name: data.nbfcName,
                rbi_license_number: data.rbiLicense,
                contact_email: data.email,
                contact_phone: data.phone,
                loan_criteria: {
                    min_credit_score: parseInt(data.minCreditScore),
                    max_loan_amount: parseInt(data.maxLoanAmount),
                    min_loan_amount: parseInt(data.minLoanAmount),
                    preferred_regions: data.preferredRegions || [],
                    loan_tenure_months: parseInt(data.tenureMonths),
                    interest_rate: parseFloat(data.interestRate),
                }
            };

            console.log('📤 Sending payload to API:', payload);
            const response = await nbfcAPI.verifyNBFC(payload);
            console.log('✅ API Response:', response.data);

            // Check if verification was successful
            if (!response.data.verified) {
                toast.error(response.data.message || 'NBFC verification failed');
                console.error('❌ Verification failed:', response.data.message);
                return;
            }

            if (response.data.nbfc_id) {
                console.log('💾 Saving nbfc_id to context:', response.data.nbfc_id);
                updateNBFCData({
                    nbfcId: response.data.nbfc_id,
                    nbfcName: data.nbfcName,
                });
                toast.success('NBFC registered successfully!');
                console.log('🔄 Navigating to dashboard...');
                setTimeout(() => navigate('/nbfc/dashboard'), 1000);
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            console.error('Error details:', error.response?.data);
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
                            onClick={(e) => {
                                console.log('🖱️ Button clicked!');
                                console.log('Form errors:', errors);
                                alert('Button was clicked! Check console for details.');
                            }}
                            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            <span>{loading ? 'Registering...' : 'Register NBFC'}</span>
                        </button>

                        {/* DEBUG: Test button that bypasses form validation */}
                        <button
                            type="button"
                            onClick={async () => {
                                console.log('🧪 TEST BUTTON CLICKED');
                                const testPayload = {
                                    nbfc_name: "Test NBFC",
                                    rbi_license_number: "N-14.03296",
                                    contact_email: "test@nbfc.com",
                                    contact_phone: "9898989898",
                                    loan_criteria: {
                                        min_credit_score: 700,
                                        max_loan_amount: 500000,
                                        min_loan_amount: 100000,
                                        loan_tenure_months: 24,
                                        preferred_regions: ["Mumbai"],
                                        interest_rate: 13.5
                                    }
                                };
                                try {
                                    console.log('📤 Calling API with test payload...');
                                    const response = await nbfcAPI.verifyNBFC(testPayload);
                                    console.log('✅ Test API Response:', response.data);
                                    alert('API call successful! Check console. nbfc_id: ' + response.data.nbfc_id);
                                } catch (error) {
                                    console.error('❌ Test API Error:', error);
                                    alert('API call failed! Check console.');
                                }
                            }}
                            className="w-full px-6 py-3 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-600 transition"
                        >
                            🧪 TEST API CALL (Debug)
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NBFCRegister;
