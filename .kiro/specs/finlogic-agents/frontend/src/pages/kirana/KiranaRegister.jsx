import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CheckCircle, Loader2, Upload } from 'lucide-react';
import { kiranaAPI } from '../../api';
import { useKirana } from '../../context/KiranaContext';

const KiranaRegister = () => {
    const navigate = useNavigate();
    const { updateKiranaData } = useKirana();
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [gstCertificate, setGstCertificate] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setGstCertificate(file);
            toast.success('GST certificate uploaded');
        } else {
            toast.error('Please upload a PDF file');
        }
    };

    const onSubmit = async (data) => {
        if (!gstCertificate) {
            toast.error('Please upload GST certificate');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('gst_number', data.gstNumber);
            formData.append('store_name', data.storeName);
            formData.append('location', data.location);
            formData.append('owner_name', data.ownerName);
            formData.append('phone_number', data.phone);
            formData.append('gst_certificate', gstCertificate);

            const response = await kiranaAPI.verifyGST(formData);

            if (response.data.kirana_id) {
                setVerified(true);
                updateKiranaData({
                    kiranaId: response.data.kirana_id,
                    storeName: data.storeName,
                    ownerName: data.ownerName,
                    location: data.location,
                    phone: data.phone,
                    gstNumber: data.gstNumber,
                });
                toast.success('GST verified successfully!');
                setTimeout(() => navigate('/kirana/upload'), 2000);
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-bg-card rounded-2xl p-8 border border-gray-800">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Kirana Store Registration</h1>
                    <p className="text-text-muted mb-8">Register your store and verify GST to get started</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Store Name</label>
                            <input
                                {...register('storeName', { required: 'Store name is required' })}
                                className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                placeholder="Enter store name"
                            />
                            {errors.storeName && <p className="text-red-400 text-sm mt-1">{errors.storeName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Owner Name</label>
                            <input
                                {...register('ownerName', { required: 'Owner name is required' })}
                                className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                placeholder="Enter owner name"
                            />
                            {errors.ownerName && <p className="text-red-400 text-sm mt-1">{errors.ownerName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">GST Number</label>
                            <input
                                {...register('gstNumber', {
                                    required: 'GST number is required',
                                    pattern: {
                                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                                        message: 'Invalid GST format'
                                    }
                                })}
                                className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                placeholder="27AABCU9603R1ZM"
                            />
                            {errors.gstNumber && <p className="text-red-400 text-sm mt-1">{errors.gstNumber.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Location / City</label>
                            <input
                                {...register('location', { required: 'Location is required' })}
                                className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                                placeholder="Mumbai"
                            />
                            {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                            <input
                                {...register('phone', {
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: 'Invalid phone number'
                                    }
                                })}
                                className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                placeholder="9876543210"
                            />
                            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">GST Certificate (PDF)</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="gst-certificate"
                                />
                                <label
                                    htmlFor="gst-certificate"
                                    className="w-full px-4 py-3 bg-bg-dark border border-gray-700 rounded-lg text-white cursor-pointer hover:border-primary transition flex items-center justify-between"
                                >
                                    <span className={gstCertificate ? 'text-white' : 'text-text-muted'}>
                                        {gstCertificate ? gstCertificate.name : 'Upload GST Certificate'}
                                    </span>
                                    <Upload className="w-5 h-5 text-text-muted" />
                                </label>
                            </div>
                        </div>

                        {verified && (
                            <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">GST Verified Successfully!</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || verified}
                            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            <span>{loading ? 'Verifying...' : verified ? 'Verified' : 'Verify & Continue'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default KiranaRegister;
