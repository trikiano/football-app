import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
const DEFAULT_PASSWORD = 'admin123';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('fb_auth') === 'true');
  const [playerSession, setPlayerSession] = useState(() => JSON.parse(localStorage.getItem('fb_player_session') || 'null'));
  const [players, setPlayers] = useState(() => JSON.parse(localStorage.getItem('fb_players') || '[]'));
  const [matches, setMatches] = useState(() => JSON.parse(localStorage.getItem('fb_matches') || '[]'));

  useEffect(() => { localStorage.setItem('fb_players', JSON.stringify(players)); }, [players]);
  useEffect(() => { localStorage.setItem('fb_matches', JSON.stringify(matches)); }, [matches]);

  // ── Admin auth ──
  const login = (password) => {
    const stored = localStorage.getItem('fb_password') || DEFAULT_PASSWORD;
    if (password === stored) { setIsAuthenticated(true); localStorage.setItem('fb_auth', 'true'); return true; }
    return false;
  };
  const logout = () => { setIsAuthenticated(false); localStorage.removeItem('fb_auth'); };
  const changePassword = (pw) => localStorage.setItem('fb_password', pw);

  // ── Player auth ──
  const loginAsPlayer = (phone, pin) => {
    const cleaned = phone.replace(/\s/g, '');
    const p = players.find(p => p.phone?.replace(/\s/g, '') === cleaned && p.pin === pin);
    if (p) {
      const session = { playerId: p.id };
      setPlayerSession(session);
      localStorage.setItem('fb_player_session', JSON.stringify(session));
      return p;
    }
    return null;
  };
  const logoutPlayer = () => { setPlayerSession(null); localStorage.removeItem('fb_player_session'); };

  // ── Players ──
  const addPlayer = (name, position = 'MID') => {
    const p = { id: generateId(), name: name.trim(), position, phone: '', pin: '', birthday: '', photo: '', createdAt: new Date().toISOString() };
    setPlayers(prev => [...prev, p]);
    return p;
  };
  const updatePlayer = (id, updates) => setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const removePlayer = (id) => setPlayers(prev => prev.filter(p => p.id !== id));
  const getPlayer = (id) => players.find(p => p.id === id);

  // ── Matches ──
  const createMatch = (data) => {
    const m = {
      id: generateId(), date: data.date,
      isRecurring: data.isRecurring || false, recurringDay: data.recurringDay || null,
      teamSize: data.teamSize || 7, formKeyA: data.formKeyA, formKeyB: data.formKeyB,
      teamA: data.teamA || [], teamB: data.teamB || [],
      formationA: data.formationA, formationB: data.formationB,
      subsA: data.subsA || [], subsB: data.subsB || [],
      scoreA: 0, scoreB: 0, goals: [],
      status: 'scheduled', manOfMatch: null, ratings: {},
      playerMatchRatings: {}, // { playerId: { score, comment } }
      notes: '', createdAt: new Date().toISOString(),
    };
    setMatches(prev => [...prev, m]);
    return m.id;
  };
  const updateMatch = (id, updates) => setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const deleteMatch = (id) => setMatches(prev => prev.filter(m => m.id !== id));
  const startMatch = (id) => updateMatch(id, { status: 'live', startedAt: new Date().toISOString() });
  const finishMatch = (id) => updateMatch(id, { status: 'finished', finishedAt: new Date().toISOString() });

  const addGoal = (matchId, { playerId, team, minute }) => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const goal = { id: generateId(), playerId, team, minute };
      const goals = [...m.goals, goal];
      return { ...m, goals, scoreA: goals.filter(g => g.team === 'A').length, scoreB: goals.filter(g => g.team === 'B').length };
    }));
  };
  const removeGoal = (matchId, goalId) => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const goals = m.goals.filter(g => g.id !== goalId);
      return { ...m, goals, scoreA: goals.filter(g => g.team === 'A').length, scoreB: goals.filter(g => g.team === 'B').length };
    }));
  };

  // Player self-rating of a match
  const setPlayerMatchRating = (matchId, playerId, score, comment = '') => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      return { ...m, playerMatchRatings: { ...(m.playerMatchRatings||{}), [playerId]: { score, comment, updatedAt: new Date().toISOString() } } };
    }));
  };

  // ── Stats ──
  const getTopScorers = () => {
    const map = {};
    matches.filter(m => m.status === 'finished').forEach(m => {
      m.goals.forEach(g => { if (g.playerId) map[g.playerId] = (map[g.playerId] || 0) + 1; });
    });
    return Object.entries(map).map(([id, goals]) => ({ player: getPlayer(id), goals })).filter(s => s.player).sort((a, b) => b.goals - a.goals);
  };

  const getPlayerStats = (playerId) => {
    let goals = 0, matchesPlayed = 0, wins = 0, motm = 0, avgRating = 0, ratingCount = 0;
    matches.filter(m => m.status === 'finished').forEach(m => {
      const all = [...m.teamA, ...m.teamB, ...(m.subsA||[]), ...(m.subsB||[])];
      const inA = m.teamA.includes(playerId) || (m.subsA||[]).includes(playerId);
      const inB = m.teamB.includes(playerId) || (m.subsB||[]).includes(playerId);
      if (inA || inB) {
        matchesPlayed++;
        goals += m.goals.filter(g => g.playerId === playerId).length;
        if (m.manOfMatch === playerId) motm++;
        if ((inA && m.scoreA > m.scoreB) || (inB && m.scoreB > m.scoreA)) wins++;
        if (m.ratings?.[playerId]) { avgRating += m.ratings[playerId]; ratingCount++; }
      }
    });
    return { goals, matchesPlayed, wins, motm, avgRating: ratingCount ? (avgRating / ratingCount).toFixed(1) : null };
  };

  const getPlayerMatches = (playerId) => {
    return matches
      .filter(m => [...m.teamA, ...m.teamB, ...(m.subsA||[]), ...(m.subsB||[])].includes(playerId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated, login, logout, changePassword,
      playerSession, loginAsPlayer, logoutPlayer,
      players, addPlayer, updatePlayer, removePlayer, getPlayer,
      matches, createMatch, updateMatch, deleteMatch,
      startMatch, finishMatch, addGoal, removeGoal,
      setPlayerMatchRating,
      getTopScorers, getPlayerStats, getPlayerMatches,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
