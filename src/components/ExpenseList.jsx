import React from 'react';
import { useStore } from '../store';

export default function ExpenseList() {
  const expenses = useStore((state) => state.expenses);
  const removeExpense = useStore((state) => state.removeExpense);
  const members = useStore((state) => state.members);

  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';
  const getMemberColor = (id) => members.find(m => m.id === id)?.color || '#999';

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="expense-list-container">
      <h3 className="list-title">Expenses</h3>
      {sortedExpenses.length === 0 ? (
        <p className="empty-state">No expenses yet. Add one to get started!</p>
      ) : (
        <div className="expenses-list">
          {sortedExpenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <div className="expense-header">
                <div className="expense-info">
                  <h4 className="expense-description">{expense.description}</h4>
                  <p className="expense-date">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="btn-remove-expense"
                  onClick={() => removeExpense(expense.id)}
                  title="Remove expense"
                >
                  ✕
                </button>
              </div>

              <div className="expense-split">
                <div className="paid-by" style={{ borderLeftColor: getMemberColor(expense.paidBy) }}>
                  <span className="label">Paid by</span>
                  <strong>{getMemberName(expense.paidBy)}</strong>
                  <span className="amount">${expense.amount.toFixed(2)}</span>
                </div>

                <div className="splits-breakdown">
                  {Object.entries(expense.splits)
                    .filter(([_, amount]) => amount > 0)
                    .map(([memberId, amount]) => (
                      <div key={memberId} className="split-person">
                        <div className="split-avatar" style={{ backgroundColor: getMemberColor(memberId) }}>
                          {getMemberName(memberId).charAt(0).toUpperCase()}
                        </div>
                        <div className="split-info">
                          <span className="split-name">{getMemberName(memberId)}</span>
                          <span className="split-amount">${amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
