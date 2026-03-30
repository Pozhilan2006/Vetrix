// backend/src/utils/sessionStore.js — unchanged from V1

// In-memory session store keyed by session_id
// Each session holds the accumulated intent fields across multi-turn conversation
const sessions = new Map();

const getSession = (sessionId) => {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      action: null,
      chain: null,
      asset: null,
      amount: null,
      to_address: null,
      swap: null,
      confidence: 0,
      risk_flags: [],
      human_readable_summary: '',
      turn_count: 0,
      created_at: Date.now(),
    });
  }
  return sessions.get(sessionId);
};

const updateSession = (sessionId, newFields) => {
  const session = getSession(sessionId);

  // Merge new non-null fields into session
  if (newFields.action && newFields.action !== 'unknown') session.action = newFields.action;
  if (newFields.chain) session.chain = newFields.chain;
  if (newFields.asset) session.asset = newFields.asset;
  if (newFields.amount) session.amount = newFields.amount;
  if (newFields.to_address) session.to_address = newFields.to_address;
  if (newFields.swap) session.swap = newFields.swap;
  if (newFields.confidence) session.confidence = newFields.confidence;
  if (newFields.risk_flags && newFields.risk_flags.length > 0) {
    // Merge risk flags, avoid duplicates
    const existing = new Set(session.risk_flags);
    newFields.risk_flags.forEach(f => existing.add(f));
    session.risk_flags = Array.from(existing);
  }
  if (newFields.human_readable_summary) {
    session.human_readable_summary = newFields.human_readable_summary;
  }

  session.turn_count++;
  sessions.set(sessionId, session);
  return session;
};

const clearSession = (sessionId) => {
  sessions.delete(sessionId);
};

const getAllSessions = () => {
  return Object.fromEntries(sessions);
};

module.exports = { getSession, updateSession, clearSession, getAllSessions };
