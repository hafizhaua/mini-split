# Settle Up - Expense Splitter 💰

A beautiful, fully-functional **frontend-only expense splitting application** inspired by Splitwise. Track expenses, split costs fairly, and settle debts with your group—all running locally in your browser.

## Features

✨ **Core Functionality**
- 👥 Add and manage group members with personalized colors
- 💳 Add expenses and track who paid
- ➗ Split expenses equally or with custom amounts
- 🔄 Automatic debt settlement calculation
- 📊 Visual statistics and analytics
- 💾 Persistent storage (localStorage)

## Design Philosophy

Built with a **playful-but-refined aesthetic**:
- **Typography**: Distinctive Playfair Display headings paired with Outfit body text (avoiding generic choices)
- **Color Palette**: Warm earth tones with vibrant accent colors for member identification
- **Animations**: Smooth page transitions, staggered reveals, and micro-interactions
- **Layout**: Editorial-style with generous whitespace and intelligent asymmetry
- **Polish**: Carefully crafted shadows, hover states, and visual depth

## Tech Stack

- **Framework**: React 19
- **State Management**: Zustand (with localStorage persistence)
- **Visualization**: Recharts (bar charts, pie charts)
- **Styling**: Pure CSS with custom properties
- **Build**: Vite
- **Runtime**: Frontend-only (no backend required)

## Project Structure

```
src/
├── store.js                 # Zustand store with expense logic
├── components/
│   ├── Setup.jsx           # Initial member setup
│   ├── AddExpense.jsx      # Expense form (equal/custom split)
│   ├── ExpenseList.jsx     # Display all expenses
│   ├── Settlement.jsx      # Who owes who visualization
│   └── Stats.jsx           # Charts and statistics
├── App.jsx                 # Main app component
├── App.css                 # All styling
└── index.css               # Global resets
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build

```bash
npm run build
npm run preview
```

## How to Use

### 1. **Setup Group Members**
   - Enter names and pick colors for each group member
   - Add at least 2 members to start

### 2. **Add Expenses**
   - **Expenses Tab**: Create new expenses with a description and amount
   - **Split Type**: Choose between:
     - **Equal**: Automatically split among all members
     - **Custom**: Manually define how much each person owes
   - Select who paid and submit

### 3. **View & Manage**
   - See all expenses with breakdown by person
   - Remove expenses if needed
   - Expenses sorted by date (newest first)

### 4. **Check Settlement Plan**
   - **Settlement Tab**: View who owes whom and how much
   - See simplified payment instructions
   - Check account ledger with net balances
   - Status symbols: → (owed to them), ← (they owe), = (settled)

### 5. **Analyze Statistics**
   - **Stats Tab**: View spending patterns
   - Bar charts showing total paid and personal shares
   - Pie chart of expense distribution
   - Net balance visualization
   - Key metrics: total expenses, per-person average

## Data Persistence

All data is automatically saved to **localStorage** under the key `splitwise-store`. 
- Your group and expenses persist across browser sessions
- Use the "Reset" button to start fresh

## Logic Behind Settlement

The app uses an optimized greedy algorithm to minimize payment transactions:

1. **Calculate Balances**: Determines who owes/is owed
2. **Settle Debts**: Matches debtors with creditors efficiently
3. **Minimize Transactions**: Reduces unnecessary transfers

Example:
- Alice paid $300 (owes $100)
- Bob paid $100 (owes $200)
- Result: Bob pays Alice $100

## Responsive Design

- ✅ Desktop-optimized layout
- ✅ Tablet-friendly grids
- ✅ Mobile-responsive (400px+)
- ✅ Touch-friendly buttons and inputs

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge) that support:
- ES6+ JavaScript
- CSS Grid & Flexbox
- localStorage API

## Future Enhancements

- 🌙 Dark mode toggle
- 📱 Mobile app (React Native)
- 🔐 Optional authentication & cloud sync
- 📧 Send settlement reminders
- 💬 Comments on expenses
- 📊 Monthly/category analytics
- 🏷️ Expense categories

## License

Open source for personal use.

---

**Made with attention to design detail and functional elegance.** ✨
