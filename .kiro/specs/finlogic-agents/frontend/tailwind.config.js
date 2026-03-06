/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#E8591A',
                secondary: '#1A6E3C',
                accent: '#F4C430',
                'bg-dark': '#0F1419',
                'bg-card': '#1A2332',
                'text-primary': '#FFFFFF',
                'text-muted': '#8B9EB7',
            },
            fontFamily: {
                sans: ['DM Sans', 'sans-serif'],
                heading: ['Sora', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
