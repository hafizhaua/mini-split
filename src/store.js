import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const calculateBalances = (expenses, members) => {
  const balances = {};
  members.forEach(m => {
    balances[m.id] = 0;
  });

  expenses.forEach(expense => {
    const { paidBy, splits } = expense;
    const splitEntries = Object.entries(splits || {});

    splitEntries.forEach(([memberId, rawAmount]) => {
      const amount = Number(rawAmount) || 0;
      if (memberId !== paidBy) {
        if (balances[memberId] === undefined) {
          balances[memberId] = 0;
        }
        if (balances[paidBy] === undefined) {
          balances[paidBy] = 0;
        }
        balances[memberId] -= amount;
        balances[paidBy] += amount;
      }
    });
  });

  return balances;
};

const settleDebts = (balances) => {
  const debtors = Object.entries(balances)
    .filter(([_, amount]) => amount < 0)
    .map(([id, amount]) => ({ id, amount: Math.abs(amount) }));

  const creditors = Object.entries(balances)
    .filter(([_, amount]) => amount > 0)
    .map(([id, amount]) => ({ id, amount }));

  const settlements = [];

  for (let i = 0; i < debtors.length; i++) {
    for (let j = 0; j < creditors.length; j++) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      if (debtor.amount === 0 || creditor.amount === 0) continue;

      const settlementAmount = Math.min(debtor.amount, creditor.amount);
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: parseFloat(settlementAmount.toFixed(2)),
      });

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;
    }
  }

  return settlements;
};

const settleDebtsPairwise = (expenses) => {
  const pairDebts = {};

  expenses.forEach((expense) => {
    const { paidBy, splits } = expense;
    const splitEntries = Object.entries(splits || {});

    splitEntries.forEach(([memberId, rawAmount]) => {
      const amount = Number(rawAmount) || 0;
      if (memberId === paidBy || amount <= 0) {
        return;
      }

      if (!pairDebts[memberId]) {
        pairDebts[memberId] = {};
      }
      if (!pairDebts[memberId][paidBy]) {
        pairDebts[memberId][paidBy] = 0;
      }
      pairDebts[memberId][paidBy] += amount;
    });
  });

  const people = Array.from(
    new Set([
      ...Object.keys(pairDebts),
      ...Object.values(pairDebts).flatMap((toMap) => Object.keys(toMap)),
    ])
  );

  const settlements = [];

  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      const a = people[i];
      const b = people[j];

      const aToB = pairDebts[a]?.[b] || 0;
      const bToA = pairDebts[b]?.[a] || 0;
      const net = aToB - bToA;

      if (Math.abs(net) < 0.005) {
        continue;
      }

      if (net > 0) {
        settlements.push({
          from: a,
          to: b,
          amount: parseFloat(net.toFixed(2)),
        });
      } else {
        settlements.push({
          from: b,
          to: a,
          amount: parseFloat(Math.abs(net).toFixed(2)),
        });
      }
    }
  }

  return settlements;
};

export const useStore = create(
  persist(
    (set, get) => ({
      members: [],
      expenses: [],
      lastId: 0,

      addMember: (name, color) =>
        set((state) => ({
          members: [
            ...state.members,
            { id: `member-${Date.now()}-${Math.random()}`, name, color },
          ],
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          expenses: state.expenses.filter((e) => e.paidBy !== id && !e.splits[id]),
        })),

      addExpense: (description, amount, paidBy, splits) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              id: `expense-${Date.now()}-${Math.random()}`,
              description,
              amount: parseFloat(amount),
              paidBy,
              splits: Object.fromEntries(
                Object.entries(splits).map(([id, val]) => [id, parseFloat(val)])
              ),
              date: new Date().toISOString(),
            },
          ],
        })),

      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      getBalances: () => {
        const { members, expenses } = get();
        return calculateBalances(expenses, members);
      },

      getSettlements: () => {
        const { members, expenses } = get();
        const balances = calculateBalances(expenses, members);
        return settleDebts(balances);
      },

      getPairSettlements: () => {
        const { expenses } = get();
        return settleDebtsPairwise(expenses);
      },

      getTotalExpense: () => {
        const { expenses } = get();
        return expenses.reduce((sum, e) => sum + e.amount, 0);
      },

      getExpensesByMember: (memberId) => {
        const { expenses } = get();
        return expenses.filter(
          (e) => e.paidBy === memberId || e.splits[memberId]
        );
      },

      reset: () =>
        set({
          members: [],
          expenses: [],
        }),
    }),
    {
      name: 'splitwise-store',
      partialize: (state) => ({
        members: state.members,
        expenses: state.expenses,
      }),
    }
  )
);
