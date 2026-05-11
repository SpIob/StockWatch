# StockWatch

A multi-user stock watchlist and research application that lets users track stocks with live price data and price alerts. Built with React, TypeScript, Vite, and TailwindCSS.

![StockWatch](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal)

## Features

- 🔐 **User Authentication** - Sign up and login to access your personal dashboard
- 📊 **Live Stock Data** - View real-time stock prices, % change, day high/low, and volume
- 📝 **Personal Watchlist** - Add and remove stocks to track your investments
- 🔔 **Price Alerts** - Set alerts for when stocks hit target prices (above or below)
- 🔍 **Stock Search** - Search for stocks by ticker symbol or company name
- 📱 **Responsive Design** - Clean, modern interface that works on mobile and desktop

## Tech Stack

- **Frontend Framework:** React 18.3
- **Language:** TypeScript 5.6
- **Build Tool:** Vite 5.4
- **Styling:** TailwindCSS 3.4
- **Routing:** React Router DOM 6.28
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd stockwatch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

## Project Structure

```
stockwatch/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── NavBar.tsx
│   │   ├── PriceAlertForm.tsx
│   │   ├── SearchModal.tsx
│   │   └── StockCard.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useStockData.ts
│   ├── lib/             # Utility libraries
│   │   ├── api.ts       # API integration
│   │   └── db.ts        # Database utilities
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── StockDetail.tsx
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

## Core User Flows

1. **Authentication**: Users sign up or log in to access their personal dashboard
2. **Watchlist Management**: Add/remove stocks from your personal watchlist
3. **Stock Search**: Search by ticker or company name to find stocks
4. **Price Alerts**: Set target price alerts that trigger visual notifications
5. **Stock Details**: View detailed information including live price and active alerts

## Configuration

### TailwindCSS

The project uses a custom color palette defined in `tailwind.config.js`:
- Background: Light gray (#F8FAFC)
- Primary accent: Blue (#2563EB)
- Price movements: Green (up) / Red (down)

### TypeScript

Strict TypeScript configuration is enabled. See `tsconfig.json` for compiler options.

## API Integration

StockWatch integrates with public stock price APIs (e.g., Yahoo Finance via RapidAPI or Finnhub free tier) for live market data. Configure your API credentials in the appropriate environment variables.

## Design Philosophy

- **Clean & Modern**: Light theme with card-based layouts and subtle shadows
- **Typography**: Crisp sans-serif fonts (Inter or equivalent)
- **Data Visualization**: Clear hierarchy with structured data tables
- **Minimal Decorative Elements**: Focus on functionality and readability
- **Mobile-First**: Responsive design that adapts to all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is currently undergoing development.

## Support

For issues and questions, please open an issue in the repository.
