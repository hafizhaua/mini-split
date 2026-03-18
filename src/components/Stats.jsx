import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStore } from '../store';

export default function Stats() {
  const expenses = useStore((state) => state.expenses);
  const members = useStore((state) => state.members);
  const getBalances = useStore((state) => state.getBalances);
  const getTotalExpense = useStore((state) => state.getTotalExpense);

  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';
  const getMemberColor = (id) => members.find(m => m.id === id)?.color || '#999';

  // Spending by member
  const spendingData = members.map((member) => {
    const memberExpenses = expenses.filter(e => e.paidBy === member.id);
    const total = memberExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      name: member.name,
      amount: parseFloat(total.toFixed(2)),
      fill: member.color,
    };
  });

  // Who owes what
  const balances = getBalances();
  const balanceData = members.map((member) => ({
    name: member.name,
    balance: parseFloat(balances[member.id].toFixed(2)),
    fill: member.color,
  }));

  // Expense breakdown per person
  const owesData = members.map((member) => {
    const personalExpenses = expenses.filter(e => e.splits[member.id]);
    const total = personalExpenses.reduce((sum, e) => sum + (e.splits[member.id] || 0), 0);
    return {
      name: member.name,
      amount: parseFloat(total.toFixed(2)),
      fill: member.color,
    };
  });

  const totalExpense = getTotalExpense();
  const averagePerPerson = members.length > 0 ? totalExpense / members.length : 0;

  return (
    <div className="stats-container">
      <h3 className="stats-title">Statistics</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">${totalExpense.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Per Person</div>
          <div className="stat-value">${averagePerPerson.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{expenses.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Group Size</div>
          <div className="stat-value">{members.length}</div>
        </div>
      </div>

      <div className="charts-grid">
        {spendingData.some(d => d.amount > 0) && (
          <div className="chart-container">
            <h4 className="chart-title">Total Paid</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#8884d8" radius={[8, 8, 0, 0]}>
                  {spendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {owesData.some(d => d.amount > 0) && (
          <div className="chart-container">
            <h4 className="chart-title">Personal Share</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={owesData.filter(d => d.amount > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, amount }) => `${name}: $${amount.toFixed(2)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {owesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {balanceData.some(d => d.balance !== 0) && (
          <div className="chart-container">
            <h4 className="chart-title">Net Balance</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={balanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="balance" fill="#82ca9d" radius={[8, 8, 0, 0]}>
                  {balanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.balance > 0 ? '#4ECDC4' : entry.balance < 0 ? '#FF6B6B' : '#999'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {expenses.length === 0 && (
        <div className="empty-stats">
          <p>Add expenses to see statistics</p>
        </div>
      )}
    </div>
  );
}
