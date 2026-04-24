import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Plus, Minus, Flag, X } from 'lucide-react';

export default function LiveScore() {
  const { id } = useParams();
  const { matches, players, addGoal, removeGoal, startMatch, finishMatch, getPlayer } = useApp();
  const navigate = useNavigate();
  const match = matches.find(m => m.id === id);

  const [elapsed, setElapsed] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(null); // 'A' | 'B' | null
  const [selectedPlayer, setSelectedPlayer] = useState('');

  useEffect(() => {
    if (!match) return;
    if (match.status === 'scheduled') startMatch(id);
  }, []);

  useEffect(() => {
    if (!match?.startedAt) return;
    const start = new Date(match.startedAt).getTime();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 60000));
    }, 10000);
    setElapsed(Math.floor((Date.now() - new Date(match.startedAt).getTime()) / 60000));
    return () => clearInterval(timer);
  }, [match?.startedAt]);

  if (!match) return null;

  const teamPlayers = (team) =>
    (team === 'A' ? match.teamA : match.teamB)
      .map(id => players.find(p => p.id === id))
      .filter(Boolean);

  const handleGoal = () => {
    if (!showGoalModal) return;
    addGoal(id, {
      playerId: selectedPlayer || null,
      team: showGoalModal,
      minute: elapsed,
    });
    setShowGoalModal(null);
    setSelectedPlayer('');
  };

  const handleFinish = () => {
    finishMatch(id);
    navigate(`/matches/${id}`);
  };

  const goals = [...match.goals].sort((a, b) => a.minute - b.minute);

  return (
    <div className="pb-24 min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 px-4 pt-10 pb-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate(-1)} className="text-slate-400">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-bold text-sm">LIVE — {elapsed}'</span>
          </div>
          <button
            onClick={handleFinish}
            className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
          >
            <Flag size={14} /> Fin
          </button>
        </div>

        {/* Score */}
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-center">
            <p className="text-green-400 font-bold text-lg">Équipe A</p>
            <p className="text-white text-6xl font-black mt-1">{match.scoreA}</p>
          </div>
          <div className="text-slate-600 font-bold text-3xl">–</div>
          <div className="flex-1 text-center">
            <p className="text-blue-400 font-bold text-lg">Équipe B</p>
            <p className="text-white text-6xl font-black mt-1">{match.scoreB}</p>
          </div>
        </div>

        {/* Goal buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setShowGoalModal('A')}
            className="flex-1 bg-green-600 active:bg-green-700 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
          >
            <Plus size={20} /> But A
          </button>
          <button
            onClick={() => setShowGoalModal('B')}
            className="flex-1 bg-blue-600 active:bg-blue-700 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
          >
            <Plus size={20} /> But B
          </button>
        </div>
      </div>

      {/* Goals timeline */}
      <div className="px-4 mt-5">
        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-3">Buts marqués</h2>
        {goals.length === 0 && (
          <p className="text-center text-slate-600 py-6">Aucun but pour l'instant</p>
        )}
        <div className="space-y-2">
          {goals.map(g => {
            const scorer = g.playerId ? getPlayer(g.playerId) : null;
            return (
              <div key={g.id} className={`flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 ${g.team === 'A' ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'}`}>
                <span className="text-slate-400 text-sm w-8">{g.minute}'</span>
                <span className="text-white flex-1">⚽ {scorer ? scorer.name : 'Inconnu'}</span>
                <span className={`font-bold text-sm ${g.team === 'A' ? 'text-green-400' : 'text-blue-400'}`}>Équipe {g.team}</span>
                <button onClick={() => removeGoal(id, g.id)} className="text-slate-600 ml-1">
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div className="bg-slate-900 w-full rounded-t-3xl p-5 pb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">
                ⚽ But — Équipe {showGoalModal}
              </h3>
              <button onClick={() => setShowGoalModal(null)} className="text-slate-400">
                <X size={22} />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-3">Qui a marqué ?</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => setSelectedPlayer('')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${!selectedPlayer ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-300'}`}
              >
                Joueur inconnu / CSC
              </button>
              {teamPlayers(showGoalModal).map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayer(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${selectedPlayer === p.id ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleGoal}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base mt-4"
            >
              Confirmer le but ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
