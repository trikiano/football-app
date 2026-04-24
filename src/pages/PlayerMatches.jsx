import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ChevronRight } from 'lucide-react';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PlayerMatches() {
  const { playerSession, getPlayer, getPlayerMatches } = useApp();
  const navigate = useNavigate();
  const player = getPlayer(playerSession?.playerId);
  if (!player) return null;

  const myMatches = getPlayerMatches(player.id);
  const finished = myMatches.filter(m => m.status === 'finished');
  const upcoming = myMatches.filter(m => m.status === 'scheduled');

  const getMyTeam = (m) => m.teamA.includes(player.id) || (m.subsA||[]).includes(player.id) ? 'A' : 'B';
  const didWin = (m) => { const t = getMyTeam(m); return (t==='A'&&m.scoreA>m.scoreB)||(t==='B'&&m.scoreB>m.scoreA); };

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      <div className="bg-slate-900 px-4 pt-10 pb-5">
        <button onClick={() => navigate('/player')} className="text-slate-400 mb-4"><ArrowLeft size={24}/></button>
        <h1 className="text-2xl font-bold text-white">Mes matchs</h1>
        <p className="text-slate-400 text-sm mt-1">{finished.length} match{finished.length !== 1 ? 's' : ''} joué{finished.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 mt-4 space-y-5">
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-white font-bold mb-3">À venir</h2>
            <div className="space-y-2">
              {upcoming.map(m => (
                <Link key={m.id} to={`/player/match/${m.id}`} className="flex items-center gap-3 bg-slate-800 rounded-2xl px-4 py-3">
                  <div className="w-2 h-10 rounded-full flex-shrink-0 bg-slate-500"/>
                  <div className="flex-1">
                    <p className="text-white font-semibold capitalize">{formatDate(m.date)}</p>
                    <p className="text-slate-400 text-xs">Équipe {getMyTeam(m)} · Prévu</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-600"/>
                </Link>
              ))}
            </div>
          </section>
        )}

        {finished.length > 0 && (
          <section>
            <h2 className="text-white font-bold mb-3">Historique</h2>
            <div className="space-y-2">
              {finished.map(m => {
                const myTeam = getMyTeam(m);
                const won = didWin(m);
                const drew = m.scoreA === m.scoreB;
                const myGoals = m.goals.filter(g => g.playerId === player.id).length;
                const adminRating = m.ratings?.[player.id];
                const isStarter = m.teamA.includes(player.id) || m.teamB.includes(player.id);
                return (
                  <Link key={m.id} to={`/player/match/${m.id}`} className="flex items-center gap-3 bg-slate-800 rounded-2xl px-4 py-3">
                    <div className={`w-2 h-10 rounded-full flex-shrink-0 ${won?'bg-green-500':drew?'bg-yellow-500':'bg-red-500'}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-xs capitalize">{formatDate(m.date)}</p>
                      <p className="text-white font-bold">
                        <span className="text-green-400">A</span> {m.scoreA} – {m.scoreB} <span className="text-blue-400">B</span>
                        <span className={`ml-2 text-xs ${myTeam==='A'?'text-green-400':'text-blue-400'}`}>(Éq.{myTeam})</span>
                        {!isStarter && <span className="ml-1 text-slate-500 text-xs">🔄</span>}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {myGoals > 0 && <p className="text-green-400 text-xs font-bold">{myGoals} ⚽</p>}
                      {adminRating > 0 && <p className="text-yellow-400 text-xs">{'★'.repeat(adminRating)}{'☆'.repeat(5-adminRating)}</p>}
                      {m.manOfMatch === player.id && <p className="text-yellow-400 text-xs">⭐ MOTM</p>}
                    </div>
                    <ChevronRight size={14} className="text-slate-600 flex-shrink-0"/>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {myMatches.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-white font-bold text-lg">Aucun match</p>
            <p className="text-slate-400 text-sm mt-1">Tu apparaîtras ici dès que l'admin t'assigne à un match</p>
          </div>
        )}
      </div>
    </div>
  );
}
