import { Link } from 'react-router-dom';
import { Store, Building2 } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-bg-card border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-heading font-bold text-white">KiranaLink</span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/kirana/register" className="flex items-center space-x-2 text-text-muted hover:text-white transition">
                            <Store className="w-4 h-4" />
                            <span>Kirana Portal</span>
                        </Link>
                        <Link to="/nbfc/register" className="flex items-center space-x-2 text-text-muted hover:text-white transition">
                            <Building2 className="w-4 h-4" />
                            <span>NBFC Portal</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
