import { createContext, useContext, useState, useEffect } from 'react';

const NBFCContext = createContext();

export const useNBFC = () => {
    const context = useContext(NBFCContext);
    if (!context) {
        throw new Error('useNBFC must be used within NBFCProvider');
    }
    return context;
};

export const NBFCProvider = ({ children }) => {
    const [nbfcData, setNbfcData] = useState(() => {
        const saved = sessionStorage.getItem('nbfcData');
        return saved ? JSON.parse(saved) : {
            nbfcId: null,
            nbfcName: '',
            fundsAvailable: true,
            fundsAmount: 2500000,
            matchedKiranas: [],
            pendingRequests: [],
        };
    });

    useEffect(() => {
        sessionStorage.setItem('nbfcData', JSON.stringify(nbfcData));
    }, [nbfcData]);

    const updateNBFCData = (updates) => {
        setNbfcData(prev => ({ ...prev, ...updates }));
    };

    const resetNBFCData = () => {
        setNbfcData({
            nbfcId: null,
            nbfcName: '',
            fundsAvailable: true,
            fundsAmount: 2500000,
            matchedKiranas: [],
            pendingRequests: [],
        });
        sessionStorage.removeItem('nbfcData');
    };

    return (
        <NBFCContext.Provider value={{ nbfcData, updateNBFCData, resetNBFCData }}>
            {children}
        </NBFCContext.Provider>
    );
};
