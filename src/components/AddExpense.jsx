import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils/currency';

export default function AddExpense({ onExpenseAdded }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState({});

  const members = useStore((state) => state.members);
  const addExpense = useStore((state) => state.addExpense);

  const initializeCustomSplits = (memberId) => {
    const splits = {};
    members.forEach((m) => {
      splits[m.id] = splitType === 'equal' ? (parseFloat(amount) / members.length).toFixed(2) : '0';
    });
    return splits;
  };

  const handlePaidByChange = (e) => {
    const selectedId = e.target.value;
    setPaidBy(selectedId);
    if (splitType === 'equal') {
      setCustomSplits(initializeCustomSplits(selectedId));
    }
  };

  const handleSplitTypeChange = (e) => {
    const newType = e.target.value;
    setSplitType(newType);
    if (newType === 'equal' && amount) {
      setCustomSplits(initializeCustomSplits(paidBy));
    } else {
      setCustomSplits({});
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    if (splitType === 'equal' && val) {
      setCustomSplits(initializeCustomSplits(paidBy));
    }
  };

  const handleCustomSplitChange = (memberId, value) => {
    setCustomSplits((prev) => ({
      ...prev,
      [memberId]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim() || !amount || !paidBy) {
      alert('Please fill all required fields');
      return;
    }

    let splits = {};
    if (splitType === 'equal') {
      const splitAmount = (parseFloat(amount) / members.length).toFixed(2);
      members.forEach((m) => {
        splits[m.id] = parseFloat(splitAmount);
      });
    } else {
      const total = Object.values(customSplits).reduce((a, b) => a + parseFloat(b || 0), 0);
      if (Math.abs(total - parseFloat(amount)) > 0.01) {
        alert(`Splits must equal ${formatCurrency(amount)}. Current: ${formatCurrency(total)}`);
        return;
      }
      members.forEach((m) => {
        splits[m.id] = parseFloat(customSplits[m.id] || 0);
      });
    }

    addExpense(description, amount, paidBy, splits);
    setDescription('');
    setAmount('');
    setPaidBy('');
    setCustomSplits({});
    setSplitType('equal');
    if (onExpenseAdded) onExpenseAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h3 className="form-title">Add Expense</h3>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Dinner at restaurant"
          maxLength="40"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Amount (IDR)</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Paid By</label>
          <select value={paidBy} onChange={handlePaidByChange} required>
            <option value="">Select member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Split Type</label>
        <div className="split-type-buttons">
          <button
            type="button"
            className={`split-btn ${splitType === 'equal' ? 'active' : ''}`}
            onClick={() => {
              setSplitType('equal');
              if (amount) setCustomSplits(initializeCustomSplits(paidBy));
            }}
          >
            Equal
          </button>
          <button
            type="button"
            className={`split-btn ${splitType === 'custom' ? 'active' : ''}`}
            onClick={() => setSplitType('custom')}
          >
            Custom
          </button>
        </div>
      </div>

      {splitType === 'custom' && (
        <div className="custom-splits">
          {members.map((member) => (
            <div key={member.id} className="split-input">
              <label>{member.name}</label>
              <input
                type="number"
                value={customSplits[member.id] || ''}
                onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                placeholder="0"
                step="0.01"
                min="0"
              />
            </div>
          ))}
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-submit">
        Add Expense
      </button>
    </form>
  );
}
