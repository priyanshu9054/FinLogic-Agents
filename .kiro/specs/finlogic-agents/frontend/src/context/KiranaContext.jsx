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
            statementSummary: {},
            kycComplete: false,
            matchedNBFCs: [],
        };
    });

    useEffect(() => {
        sessionStorage.setItem('kiranaData', JSON.stringify(kiranaData));
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
            statementSummary: {},
            kycComplete: false,
            matchedNBFCs: [],
        });
        sessionStorage.removeItem('kiranaData');
    };

    return (
        <KiranaContext.Provider value={{ kiranaData, updateKiranaData, resetKiranaData }}>
            {children}
        </KiranaContext.Provider>
    );
};
