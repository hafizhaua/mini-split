import React, { useState } from 'react';
import { useStore } from '../store';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

export default function Setup({ onStart }) {
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const members = useStore((state) => state.members);
  const addMember = useStore((state) => state.addMember);
  const removeMember = useStore((state) => state.removeMember);
  const reset = useStore((state) => state.reset);

  const handleAdd = () => {
    if (name.trim()) {
      addMember(name, COLORS[colorIndex % COLORS.length]);
      setName('');
      setColorIndex((i) => i + 1);
    }
  };

  const handleStart = () => {
    if (members.length >= 2) {
      onStart();
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h1 className="setup-title">Settle Up</h1>
        <p className="setup-subtitle">Who's splitting today?</p>
      </div>

      <div className="setup-content">
        <div className="add-member-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Enter name"
            maxLength="20"
            className="member-input"
          />
          <div className="color-picker">
            {COLORS.map((color, idx) => (
              <button
                key={color}
                className={`color-option ${colorIndex % COLORS.length === idx ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setColorIndex(idx)}
                title={`Color ${idx + 1}`}
              />
            ))}
          </div>
          <button onClick={handleAdd} className="btn btn-primary">
            Add Member
          </button>
        </div>

        <div className="members-display">
          <h2 className="members-title">Group ({members.length})</h2>
          <div className="members-grid">
            {members.map((member) => (
              <div
                key={member.id}
                className="member-card"
                style={{ borderLeftColor: member.color }}
              >
                <div className="member-avatar" style={{ backgroundColor: member.color }}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="member-name">{member.name}</span>
                <button
                  className="btn-remove"
                  onClick={() => removeMember(member.id)}
                  title="Remove member"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="setup-actions">
          {members.length >= 2 && (
            <button onClick={handleStart} className="btn btn-launch">
              Start Splitting
            </button>
          )}
          {members.length > 0 && (
            <button onClick={handleReset} className="btn btn-secondary">
              Reset All
            </button>
          )}
          {members.length < 2 && (
            <p className="hint">Add at least 2 members to get started</p>
          )}
        </div>
      </div>
    </div>
  );
}
