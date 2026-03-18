import React, { useState, useEffect } from 'react';
import Setup from './components/Setup';
import AddExpense from './components/AddExpense';
import ExpenseList from './components/ExpenseList';
import Settlement from './components/Settlement';
import Stats from './components/Stats';
import { useStore } from './store';
import './App.css';

function App() {
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const members = useStore((state) => state.members);

  if (!started) {
    return <Setup onStart={() => setStarted(true)} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">Settle Up</h1>
            <p className="app-subtitle">Track who paid, split expenses</p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (window.confirm('Reset everything? This cannot be undone.')) {
                useStore.setState({
                  members: [],
                  expenses: [],
                });
                setStarted(false);
              }
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`tab ${activeTab === 'settlement' ? 'active' : ''}`}
          onClick={() => setActiveTab('settlement')}
        >
          Settlement
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
      </nav>

      <main className="app-main">
        <div className="container">
          {activeTab === 'expenses' && (
            <div className="content-grid">
              <div className="form-section">
                <AddExpense onExpenseAdded={() => setActiveTab('expenses')} />
              </div>
              <div className="list-section">
                <ExpenseList />
              </div>
            </div>
          )}

          {activeTab === 'settlement' && <Settlement />}

          {activeTab === 'stats' && <Stats />}
        </div>
      </main>

      <footer className="app-footer">
        <p>Settle Up • Expense Splitter</p>
      </footer>
    </div>
  );
}

export default App;
