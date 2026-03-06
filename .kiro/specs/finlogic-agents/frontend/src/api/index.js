import axios from 'axios';
import { mockKiranas, mockNBFCs } from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── KIRANA APIs ───────────────────────────────────────────────
export const kiranaAPI = {
    verifyGST: async (data) => {
        if (DEMO_MODE) {
            await delay(1000);
            return {
                data: {
                    success: true,
                    kirana_id: `kirana-${Date.now()}`,
                    verified: true,
                    ...data,
                }
            };
        }
        return api.post('/api/gst/verify', data);
    },

    uploadStatement: async (formData) => {
        if (DEMO_MODE) {
            await delay(2000);
            return {
                data: {
                    success: true,
                    summary: {
                        total_credits: 450000,
                        total_debits: 180000,
                        months_analyzed: 6,
                        invoice_match: 85,
                    }
                }
            };
        }
        return api.post('/api/statement/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    generateScore: async (kiranaId) => {
        if (DEMO_MODE) {
            await delay(1500);
            const mockKirana = mockKiranas.find(k => k.kirana_id === kiranaId) || mockKiranas[0];
            return {
                data: {
                    success: true,
                    credit_score: mockKirana.credit_score,
                    risk_level: mockKirana.risk_level,
                    loan_eligible_amount: mockKirana.loan_eligible_amount,
                    breakdown: {
                        credit_consistency: 180,
                        purchase_regularity: 160,
                        invoice_match: 170,
                        balance_health: 150,
                        business_cycle: 90,
                    }
                }
            };
        }
        return api.post('/api/score/generate', { kirana_id: kiranaId });
    },

    getMatchedNBFCs: async (kiranaId) => {
        if (DEMO_MODE) {
            await delay(800);
            const mockKirana = mockKiranas.find(k => k.kirana_id === kiranaId) || mockKiranas[0];
            const matched = mockNBFCs.filter(nbfc =>
                mockKirana.credit_score >= nbfc.min_credit_score &&
                mockKirana.loan_eligible_amount >= nbfc.min_loan_amount
            );
            return { data: { success: true, nbfcs: matched } };
        }
        return api.get(`/api/matching/nbfcs/${kiranaId}`);
    },

    requestLoan: async (data) => {
        if (DEMO_MODE) {
            await delay(1000);
            return {
                data: {
                    success: true,
                    message: 'Loan request sent successfully',
                    request_id: `REQ-${Date.now()}`,
                }
            };
        }
        return api.post('/api/loan/request', data);
    },
};

// ─── NBFC APIs ─────────────────────────────────────────────────
export const nbfcAPI = {
    verifyNBFC: async (data) => {
        if (DEMO_MODE) {
            await delay(1000);
            return {
                data: {
                    success: true,
                    nbfc_id: `nbfc-${Date.now()}`,
                    verified: true,
                    ...data,
                }
            };
        }
        return api.post('/api/nbfc/verify', data);
    },

    getMatchedKiranas: async (nbfcId) => {
        if (DEMO_MODE) {
            await delay(800);
            const mockNBFC = mockNBFCs.find(n => n.nbfc_id === nbfcId) || mockNBFCs[0];
            const matched = mockKiranas.filter(kirana =>
                kirana.credit_score >= mockNBFC.min_credit_score &&
                kirana.loan_eligible_amount >= mockNBFC.min_loan_amount
            );
            return { data: { success: true, kiranas: matched } };
        }
        return api.get(`/api/matching/kiranas/${nbfcId}`);
    },

    checkFunds: async (nbfcId) => {
        if (DEMO_MODE) {
            await delay(500);
            return {
                data: {
                    success: true,
                    funds_available: true,
                    amount: 2500000,
                }
            };
        }
        return api.get(`/api/nbfc/funds/${nbfcId}`);
    },

    disburseLoan: async (data) => {
        if (DEMO_MODE) {
            await delay(3000);
            return {
                data: {
                    success: true,
                    transaction_id: `TXN-2024-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    timestamp: new Date().toISOString(),
                }
            };
        }
        return api.post('/api/loan/disburse', data);
    },
};

export default api;
