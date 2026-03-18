const SHARE_VERSION = 1;

const toBase64Url = (text) => {
  const utf8Bytes = new TextEncoder().encode(text);
  let binary = '';
  utf8Bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (base64Url) => {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const sanitizeMembers = (members) => {
  if (!Array.isArray(members)) {
    return [];
  }

  return members
    .filter((m) => m && typeof m.id === 'string' && typeof m.name === 'string')
    .map((m) => ({
      id: m.id,
      name: m.name,
      color: typeof m.color === 'string' ? m.color : '#999999',
    }));
};

const sanitizeExpenses = (expenses, memberIds) => {
  if (!Array.isArray(expenses)) {
    return [];
  }

  return expenses
    .filter((e) => e && typeof e.id === 'string' && typeof e.paidBy === 'string' && memberIds.has(e.paidBy))
    .map((e) => {
      const rawSplits = e.splits && typeof e.splits === 'object' ? e.splits : {};
      const splits = Object.fromEntries(
        Object.entries(rawSplits)
          .filter(([memberId]) => memberIds.has(memberId))
          .map(([memberId, amount]) => [memberId, Number(amount) || 0])
      );

      return {
        id: e.id,
        description: typeof e.description === 'string' ? e.description : 'Expense',
        amount: Number(e.amount) || 0,
        paidBy: e.paidBy,
        splits,
        date: typeof e.date === 'string' ? e.date : new Date().toISOString(),
      };
    });
};

export const buildShareToken = ({ members, expenses }) => {
  const payload = {
    v: SHARE_VERSION,
    members,
    expenses,
  };

  return toBase64Url(JSON.stringify(payload));
};

export const parseShareToken = (token) => {
  try {
    const decoded = fromBase64Url(token);
    const parsed = JSON.parse(decoded);

    if (!parsed || parsed.v !== SHARE_VERSION) {
      return null;
    }

    const members = sanitizeMembers(parsed.members);
    const memberIds = new Set(members.map((m) => m.id));
    const expenses = sanitizeExpenses(parsed.expenses, memberIds);

    return { members, expenses };
  } catch {
    return null;
  }
};
