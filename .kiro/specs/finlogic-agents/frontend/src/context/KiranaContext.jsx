import { createContext, useContext, useState, useEffect } from 'react';

const KiranaContext = createContext();

export const useKirana = () => {
    const context = useContext(KiranaContext);
    if (!context) {
        throw new Error('useKirana must be used within KiranaProvider');
    }
    return context;
};

export const KiranaProvider = ({ children }) => {
    const [kiranaData, setKiranaData] = useState(() => {
        const saved = sessionStorage.getItem('kiranaData');
        return saved ? JSON.parse(saved) : {
            kiranaId: null,
            storeName: '',
            creditScore: null,
            scoreBreakdown: {},
            riskLevel: null,
            loanEligibleAmount: null,
            recommendations: [],
            statementSummary: {},
            kycComplete: false,
            matchedNBFCs: [],
        };
    });

    useEffect(() => {
        sessionStorage.setItem('kiranaData', JSON.stringify(kiranaData));

        // Also cache kirana_id separately for easy API access
        if (kiranaData.kiranaId) {
            sessionStorage.setItem('kirana_id', kiranaData.kiranaId);
        }
    }, [kiranaData]);

    const updateKiranaData = (updates) => {
        setKiranaData(prev => ({ ...prev, ...updates }));
    };

    const resetKiranaData = () => {
        setKiranaData({
            kiranaId: null,
            storeName: '',
            creditScore: null,
            scoreBreakdown: {},
            riskLevel: null,
            loanEligibleAmount: null,
            recommendations: [],
            statementSummary: {},
            kycComplete: false,
            matchedNBFCs: [],
        });
        sessionStorage.removeItem('kiranaData');
        sessionStorage.removeItem('kirana_id');
    };

    return (
        <KiranaContext.Provider value={{ kiranaData, updateKiranaData, resetKiranaData }}>
            {children}
        </KiranaContext.Provider>
    );
};
