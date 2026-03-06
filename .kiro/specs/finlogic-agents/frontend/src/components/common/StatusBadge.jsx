const StatusBadge = ({ status, score }) => {
    const getStatusColor = () => {
        if (score) {
            if (score >= 750) return 'bg-green-500/20 text-green-400 border-green-500/30';
            if (score >= 600) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            if (score >= 400) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        }

        switch (status?.toLowerCase()) {
            case 'low':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'medium':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'high':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'verified':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'pending':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {status || (score >= 750 ? 'Low Risk' : score >= 600 ? 'Medium Risk' : score >= 400 ? 'High Risk' : 'Very High Risk')}
        </span>
    );
};

export default StatusBadge;
