import React, { useState } from 'react';
import { useStore } from '../store';

export default function Settlement() {
  const [mode, setMode] = useState('optimized');
  const getSettlements = useStore((state) => state.getSettlements);
  const getPairSettlements = useStore((state) => state.getPairSettlements);
  const getBalances = useStore((state) => state.getBalances);
  const members = useStore((state) => state.members);

  const settlements = mode === 'pairwise' ? getPairSettlements() : getSettlements();
  const balances = getBalances();

  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';
  const getMemberColor = (id) => members.find(m => m.id === id)?.color || '#999';

  const getLedgerEntries = () => {
    return Object.entries(balances)
      .map(([memberId, balance]) => ({ memberId, balance }))
      .sort((a, b) => b.balance - a.balance);
  };

  return (
    <div className="settlement-container">
      <h3 className="settlement-title">Settlement Plan</h3>

      <div className="settlement-mode-toggle">
        <button
          type="button"
          className={`mode-btn ${mode === 'optimized' ? 'active' : ''}`}
          onClick={() => setMode('optimized')}
        >
          Optimized
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === 'pairwise' ? 'active' : ''}`}
          onClick={() => setMode('pairwise')}
        >
          Pairwise
        </button>
      </div>
      <p className="settlement-mode-note">
        {mode === 'optimized'
          ? 'Optimized: minimizes total number of payments across the whole group.'
          : 'Pairwise: each settlement is netted per person-pair from shared expenses.'}
      </p>

      {settlements.length === 0 ? (
        <div className="settlement-balanced">
          <div className="balanced-icon">✓</div>
          <p className="balanced-text">Everything is settled!</p>
        </div>
      ) : (
        <div className="settlements-list">
          {settlements.map((settlement, idx) => (
            <div key={idx} className="settlement-transaction">
              <div className="transaction-flow">
                <div className="person person-from" style={{ borderColor: getMemberColor(settlement.from) }}>
                  <div className="avatar" style={{ backgroundColor: getMemberColor(settlement.from) }}>
                    {getMemberName(settlement.from).charAt(0).toUpperCase()}
                  </div>
                  <span>{getMemberName(settlement.from)}</span>
                </div>

                <div className="arrow">
                  <span className="arrow-text">pays</span>
                  <span className="amount">${settlement.amount.toFixed(2)}</span>
                </div>

                <div className="person person-to" style={{ borderColor: getMemberColor(settlement.to) }}>
                  <div className="avatar" style={{ backgroundColor: getMemberColor(settlement.to) }}>
                    {getMemberName(settlement.to).charAt(0).toUpperCase()}
                  </div>
                  <span>{getMemberName(settlement.to)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ledger">
        <h4 className="ledger-title">Account Ledger</h4>
        <div className="ledger-entries">
          {getLedgerEntries().map(({ memberId, balance }) => (
            <div key={memberId} className={`ledger-entry ${balance > 0 ? 'owed' : balance < 0 ? 'owes' : 'settled'}`}>
              <div className="ledger-member">
                <div className="avatar" style={{ backgroundColor: getMemberColor(memberId) }}>
                  {getMemberName(memberId).charAt(0).toUpperCase()}
                </div>
                <span className="name">{getMemberName(memberId)}</span>
              </div>
              <div className={`ledger-balance ${balance > 0 ? 'positive' : balance < 0 ? 'negative' : ''}`}>
                {balance > 0 ? '→' : balance < 0 ? '←' : '='}
                <span>${Math.abs(balance).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="ledger-note">
          <small>→ They are owed this amount</small>
          <small>← They owe this amount</small>
          <small>= All settled</small>
        </div>
      </div>
    </div>
  );
}
