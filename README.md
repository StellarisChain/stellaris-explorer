# Stellaris Explorer

A modern blockchain explorer for the Stellaris network, built with React and SCSS. This explorer provides a comprehensive interface to explore blocks, transactions, addresses, and network statistics, featuring a design inspired by the official Stellaris wallet (Quasar).

## Features

- 🔍 **Smart Search** - Search for blocks, transactions, and addresses with intelligent type detection
- 📊 **Real-time Network Statistics** - Monitor network health, validators, and performance metrics
- 🧱 **Block Explorer** - Browse recent blocks with detailed information
- 💸 **Transaction Viewer** - View recent transactions with status indicators
- 📈 **Network Activity Charts** - Visualize network activity over time
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- 🌙 **Dark Theme** - Beautiful dark theme matching the Stellaris brand

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: SCSS with custom design system
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/StellarisChain/stellaris-explorer.git
cd stellaris-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header/         # Navigation header
│   ├── Footer/         # Site footer
│   ├── SearchWidget/   # Search functionality
│   ├── StatsCard/      # Network statistics cards
│   ├── RecentBlocks/   # Recent blocks display
│   ├── RecentTransactions/ # Recent transactions display
│   └── NetworkChart/   # Network activity charts
├── pages/              # Page components
│   ├── Home/          # Landing page
│   ├── BlockDetails/  # Block detail page
│   ├── TransactionDetails/ # Transaction detail page
│   └── AddressDetails/ # Address detail page
├── styles/            # Global styles and variables
│   ├── variables.scss # SCSS variables
│   └── global.scss   # Global styles
├── App.tsx           # Main application component
└── main.tsx         # Application entry point
```

### Design System

The explorer uses a custom design system inspired by the Quasar wallet:

- **Colors**: Purple-based theme with gradients
- **Typography**: System fonts with monospace for addresses/hashes
- **Components**: Card-based layout with hover effects
- **Animations**: Smooth transitions and hover states

## API Integration

Currently, the explorer uses mock data for demonstration. To integrate with a real Stellaris node:

1. Create an API service module
2. Replace mock data in components with API calls
3. Add error handling and loading states
4. Implement real-time updates via WebSockets

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspired by the [Quasar Wallet](https://github.com/StellarisChain/quasar)
- Built for the Stellaris blockchain ecosystem

