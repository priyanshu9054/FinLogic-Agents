# KiranaLink Frontend

A fintech platform connecting Indian Kirana stores with NBFCs for micro-business loans.

## Tech Stack

- React 18 + Vite
- React Router v6
- Tailwind CSS
- Axios
- React Hook Form
- TanStack Query
- Lucide React
- Sonner
- Recharts

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_DEMO_MODE=true
```

## Features

### Kirana Store Flow
1. Register with GST verification
2. Complete KYC (Aadhaar, PAN, Selfie)
3. Upload bank statements and invoices
4. Get credit score and risk assessment
5. View matched NBFC loan offers
6. Request loans

### NBFC Flow
1. Register and set lending criteria
2. View matched Kirana stores
3. Review credit scores and financial data
4. Approve and disburse loans

### Demo Mode
- All API calls use mock data
- Simulated verification flows
- Interactive scenario controller
- Toggle fund availability

## Project Structure

```
src/
├── api/              # API layer and mock data
├── components/       # Reusable components
├── pages/           # Page components
├── context/         # React Context providers
├── hooks/           # Custom hooks
└── App.jsx          # Main app component
```

## Demo Credentials

The app includes preset demo data for quick testing:
- Ravi Kirana Store (Score: 750)
- Sharma General Store (Score: 580)
- Lakshmi Traders (Score: 420)

NBFCs:
- QuickCapital (Min Score: 700)
- GrowMore Finance (Min Score: 500)
- MicroLend NBFC (Min Score: 350)
