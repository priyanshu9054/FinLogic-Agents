import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { KiranaProvider } from './context/KiranaContext';
import { NBFCProvider } from './context/NBFCContext';
import Navbar from './components/common/Navbar';

// Pages
import Home from './pages/Home';
import KiranaRegister from './pages/kirana/KiranaRegister';
import KiranaKYC from './pages/kirana/KiranaKYC';
import StatementUpload from './pages/kirana/StatementUpload';
import CreditScore from './pages/kirana/CreditScore';
import LoanOffers from './pages/kirana/LoanOffers';
import NBFCRegister from './pages/nbfc/NBFCRegister';
import NBFCDashboard from './pages/nbfc/NBFCDashboard';
import ScenarioDemo from './pages/demo/ScenarioDemo';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <KiranaProvider>
                <NBFCProvider>
                    <Router>
                        <div className="min-h-screen bg-bg-dark">
                            <Navbar />
                            <Routes>
                                <Route path="/" element={<Home />} />

                                {/* Kirana Flow */}
                                <Route path="/kirana/register" element={<KiranaRegister />} />
                                <Route path="/kirana/kyc" element={<KiranaKYC />} />
                                <Route path="/kirana/upload" element={<StatementUpload />} />
                                <Route path="/kirana/score" element={<CreditScore />} />
                                <Route path="/kirana/offers" element={<LoanOffers />} />

                                {/* NBFC Flow */}
                                <Route path="/nbfc/register" element={<NBFCRegister />} />
                                <Route path="/nbfc/dashboard" element={<NBFCDashboard />} />

                                {/* Demo */}
                                <Route path="/demo" element={<ScenarioDemo />} />
                            </Routes>
                            <Toaster position="top-right" richColors />
                        </div>
                    </Router>
                </NBFCProvider>
            </KiranaProvider>
        </QueryClientProvider>
    );
}

export default App;
