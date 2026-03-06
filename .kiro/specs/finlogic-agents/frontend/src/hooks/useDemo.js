import { useState } from 'react';

export const useDemo = () => {
    const [demoMode] = useState(import.meta.env.VITE_DEMO_MODE === 'true');

    return { demoMode };
};
