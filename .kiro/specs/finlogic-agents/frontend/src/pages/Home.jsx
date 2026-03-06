import { Link } from 'react-router-dom';
import { Store, Building2, ArrowRight, CheckCircle, Play } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-bg-dark">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">
                        Empowering Kirana stores.<br />
                        <span className="text-primary">Connecting capital.</span>
                    </h1>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto mb-12">
                        KiranaLink bridges Indian Kirana stores with NBFCs for micro-business loans through intelligent matching and automated credit scoring.
                    </p>

                    {/* CTA Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                        <Link to="/kirana/register" className="group">
                            <div className="bg-bg-card border-2 border-primary hover:border-accent transition-all p-8 rounded-2xl h-full">
                                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                                    <Store className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-heading font-bold text-white mb-3">I'm a Kirana Store</h3>
                                <p className="text-text-muted mb-4">Get instant credit scoring and access to multiple loan offers</p>
                                <div className="flex items-center justify-center text-primary group-hover:text-accent transition">
                                    <span className="font-medium">Get Started</span>
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                                </div>
                            </div>
                        </Link>

                        <Link to="/nbfc/register" className="group">
                            <div className="bg-bg-card border-2 border-secondary hover:border-accent transition-all p-8 rounded-2xl h-full">
                                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-heading font-bold text-white mb-3">I'm an NBFC / Lender</h3>
                                <p className="text-text-muted mb-4">Find verified Kirana stores matching your lending criteria</p>
                                <div className="flex items-center justify-center text-secondary group-hover:text-accent transition">
                                    <span className="font-medium">Get Started</span>
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Demo Button */}
                    <Link to="/demo" className="inline-flex items-center space-x-2 px-6 py-3 bg-accent text-bg-dark rounded-lg font-medium hover:bg-opacity-90 transition">
                        <Play className="w-5 h-5" />
                        <span>Watch Demo Scenario</span>
                    </Link>
                </div>

                {/* How It Works */}
                <div className="mt-24">
                    <h2 className="text-3xl font-heading font-bold text-center text-white mb-12">How It Works</h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Kirana Flow */}
                        <div>
                            <h3 className="text-xl font-heading font-bold text-primary mb-6 flex items-center">
                                <Store className="w-6 h-6 mr-2" />
                                For Kirana Stores
                            </h3>
                            <div className="space-y-4">
                                {[
                                    'Register with GST and complete KYC verification',
                                    'Upload bank statements and invoices for analysis',
                                    'Get instant credit score and risk assessment',
                                    'Receive matched loan offers from multiple NBFCs',
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary font-bold text-sm">{i + 1}</span>
                                        </div>
                                        <p className="text-text-muted">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NBFC Flow */}
                        <div>
                            <h3 className="text-xl font-heading font-bold text-secondary mb-6 flex items-center">
                                <Building2 className="w-6 h-6 mr-2" />
                                For NBFCs
                            </h3>
                            <div className="space-y-4">
                                {[
                                    'Register and set your lending criteria',
                                    'Get matched with verified Kirana stores',
                                    'Review credit scores and financial data',
                                    'Approve and disburse loans instantly',
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-secondary font-bold text-sm">{i + 1}</span>
                                        </div>
                                        <p className="text-text-muted">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="mt-24 bg-bg-card rounded-2xl p-8">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold font-heading text-primary mb-2">3</div>
                            <div className="text-text-muted">NBFCs Connected</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold font-heading text-accent mb-2">₹15L+</div>
                            <div className="text-text-muted">Matched</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold font-heading text-secondary mb-2">3</div>
                            <div className="text-text-muted">Stores Verified</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
