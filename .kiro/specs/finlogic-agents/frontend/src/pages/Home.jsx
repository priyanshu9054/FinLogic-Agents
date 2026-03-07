import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="min-h-screen bg-bg-dark py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-heading font-bold text-white mb-4">
                        Welcome to FinLogic
                    </h1>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto">
                        Empowering financial inclusion through intelligent credit assessment
                        and seamless loan processing
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="bg-bg-card rounded-2xl border border-gray-800 p-8 hover:border-primary transition-colors">
                        <div className="text-4xl mb-4">🏪</div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            For Kirana Stores
                        </h2>
                        <p className="text-text-muted mb-6">
                            Get instant credit assessment based on your GST and bank statements.
                            Access tailored loan offers from multiple NBFCs.
                        </p>
                        <Link
                            to="/kirana/register"
                            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-medium"
                        >
                            Get Started
                        </Link>
                    </div>

                    <div className="bg-bg-card rounded-2xl border border-gray-800 p-8 hover:border-primary transition-colors">
                        <div className="text-4xl mb-4">🏦</div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            For NBFCs
                        </h2>
                        <p className="text-text-muted mb-6">
                            Access pre-qualified borrowers with comprehensive credit profiles.
                            Streamline your lending process with AI-powered insights.
                        </p>
                        <Link
                            to="/nbfc/register"
                            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-medium"
                        >
                            Partner With Us
                        </Link>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-white mb-8">
                        How It Works
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="bg-primary/10 border border-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">1</span>
                            </div>
                            <h4 className="font-semibold text-white mb-2">Register</h4>
                            <p className="text-text-muted text-sm">
                                Create your account and complete KYC verification
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary/10 border border-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">2</span>
                            </div>
                            <h4 className="font-semibold text-white mb-2">Upload Documents</h4>
                            <p className="text-text-muted text-sm">
                                Submit your GST and bank statements for analysis
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary/10 border border-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">3</span>
                            </div>
                            <h4 className="font-semibold text-white mb-2">Get Offers</h4>
                            <p className="text-text-muted text-sm">
                                Receive personalized loan offers from verified NBFCs
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
