import React, { useMemo, useState } from 'react';
import { useStore } from '../store';

export default function Settlement() {
  const [mode, setMode] = useState('optimized');
  const getSettlements = useStore((state) => state.getSettlements);
  const getPairSettlements = useStore((state) => state.getPairSettlements);
  const getBalances = useStore((state) => state.getBalances);
  const members = useStore((state) => state.members);
  const expenses = useStore((state) => state.expenses);

  const settlements = mode === 'pairwise' ? getPairSettlements() : getSettlements();
  const balances = getBalances();

  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';
  const getMemberColor = (id) => members.find(m => m.id === id)?.color || '#999';

  const optimizedBreakdown = useMemo(() => {
    const paid = {};
    const share = {};

    members.forEach((m) => {
      paid[m.id] = 0;
      share[m.id] = 0;
    });

    expenses.forEach((expense) => {
      const payer = expense.paidBy;
      paid[payer] = (paid[payer] || 0) + (Number(expense.amount) || 0);

      Object.entries(expense.splits || {}).forEach(([memberId, rawAmount]) => {
        share[memberId] = (share[memberId] || 0) + (Number(rawAmount) || 0);
      });
    });

    return members.map((m) => {
      const totalPaid = paid[m.id] || 0;
      const totalShare = share[m.id] || 0;
      return {
        memberId: m.id,
        totalPaid,
        totalShare,
        net: totalPaid - totalShare,
      };
    });
  }, [expenses, members]);

  const pairwiseBreakdown = useMemo(() => {
    const rawPairDebts = {};

    expenses.forEach((expense) => {
      const paidBy = expense.paidBy;
      Object.entries(expense.splits || {}).forEach(([memberId, rawAmount]) => {
        const amount = Number(rawAmount) || 0;
        if (memberId === paidBy || amount <= 0) {
          return;
        }

        if (!rawPairDebts[memberId]) {
          rawPairDebts[memberId] = {};
        }
        rawPairDebts[memberId][paidBy] = (rawPairDebts[memberId][paidBy] || 0) + amount;
      });
    });

    const people = Array.from(
      new Set([
        ...Object.keys(rawPairDebts),
        ...Object.values(rawPairDebts).flatMap((toMap) => Object.keys(toMap)),
      ])
    );

    const rows = [];

    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const a = people[i];
        const b = people[j];
        const aToB = rawPairDebts[a]?.[b] || 0;
        const bToA = rawPairDebts[b]?.[a] || 0;
        const net = aToB - bToA;

        if (Math.abs(aToB) < 0.005 && Math.abs(bToA) < 0.005) {
          continue;
        }

        rows.push({
          personA: a,
          personB: b,
          aToB,
          bToA,
          netFrom: net > 0 ? a : b,
          netTo: net > 0 ? b : a,
          netAmount: Math.abs(net),
        });
      }
    }

    return rows;
  }, [expenses]);

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

      <div className="calc-breakdown">
        <h4 className="ledger-title">Calculation Breakdown</h4>

        {mode === 'optimized' ? (
          <div className="table-wrap">
            <table className="calc-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Total Paid</th>
                  <th>Total Share</th>
                  <th>Net (Paid - Share)</th>
                </tr>
              </thead>
              <tbody>
                {optimizedBreakdown.map((row) => (
                  <tr key={row.memberId}>
                    <td>
                      <span className="table-member">
                        <span
                          className="table-dot"
                          style={{ backgroundColor: getMemberColor(row.memberId) }}
                        />
                        {getMemberName(row.memberId)}
                      </span>
                    </td>
                    <td>${row.totalPaid.toFixed(2)}</td>
                    <td>${row.totalShare.toFixed(2)}</td>
                    <td className={row.net >= 0 ? 'table-positive' : 'table-negative'}>
                      {row.net >= 0 ? '+' : '-'}${Math.abs(row.net).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="calc-table">
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>{'A -> B (Raw)'}</th>
                  <th>{'B -> A (Raw)'}</th>
                  <th>Net Settlement</th>
                </tr>
              </thead>
              <tbody>
                {pairwiseBreakdown.map((row) => (
                  <tr key={`${row.personA}-${row.personB}`}>
                    <td>
                      {getMemberName(row.personA)} {'<->'} {getMemberName(row.personB)}
                    </td>
                    <td>
                      {getMemberName(row.personA)} {'->'} {getMemberName(row.personB)}: ${row.aToB.toFixed(2)}
                    </td>
                    <td>
                      {getMemberName(row.personB)} {'->'} {getMemberName(row.personA)}: ${row.bToA.toFixed(2)}
                    </td>
                    <td>
                      {row.netAmount < 0.005
                        ? 'Settled'
                        : `${getMemberName(row.netFrom)} -> ${getMemberName(row.netTo)}: $${row.netAmount.toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
