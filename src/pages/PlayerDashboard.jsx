import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronRight, Flame } from 'lucide-react';
import { POSITIONS, PosBadge } from './Players';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function PlayerDashboard() {
  const { playerSession, getPlayer, getPlayerStats, getPlayerMatches, matches } = useApp();
  const player = getPlayer(playerSession?.playerId);
  if (!player) return null;

  const stats = getPlayerStats(player.id);
  const myMatches = getPlayerMatches(player.id);
  const upcoming = myMatches.filter(m => m.status === 'scheduled').slice(0, 2);
  const recent = myMatches.filter(m => m.status === 'finished').slice(0, 4);
  const liveMatch = myMatches.find(m => m.status === 'live');
  const cfg = POSITIONS[player.position] || POSITIONS.MID;

  const getMyTeam = (m) => m.teamA.includes(player.id) || (m.subsA||[]).includes(player.id) ? 'A' : 'B';
  const didWin = (m) => { const t = getMyTeam(m); return (t==='A'&&m.scoreA>m.scoreB)||(t==='B'&&m.scoreB>m.scoreA); };

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      {/* Hero header */}
      <div className="bg-slate-900 px-4 pt-10 pb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            {player.photo ? (
              <img src={player.photo} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
            ) : (
              <div className={`w-16 h-16 rounded-full ${cfg.color} flex items-center justify-center text-white font-black text-2xl border-2 border-white/20`}>
                {player.name[0].toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              <PosBadge pos={player.position} small />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-sm">Bienvenue 👋</p>
            <h1 className="text-2xl font-black text-white">{player.name}</h1>
            {player.birthday && (
              <p className="text-slate-500 text-xs mt-0.5">🎂 {new Date(player.birthday).toLocaleDateString('fr-FR', {day:'numeric',month:'long'})}</p>
            )}
          </div>
          <Link to="/player/profile" className="bg-slate-700 p-2.5 rounded-xl text-slate-300">
            ✏️
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Matchs', value: stats.matchesPlayed, icon: '📅' },
            { label: 'Buts',   value: stats.goals,         icon: '⚽' },
            { label: 'Victoires', value: stats.wins,       icon: '🏆' },
            { label: 'MOTM',   value: stats.motm,          icon: '⭐' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-slate-800 rounded-2xl p-2.5 text-center">
              <p className="text-lg">{icon}</p>
              <p className="text-white font-black text-lg leading-tight">{value}</p>
              <p className="text-slate-500 text-[10px]">{label}</p>
            </div>
          ))}
        </div>

        {/* Avg rating */}
        {stats.avgRating && (
          <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-xl">⭐</span>
            <div>
              <p className="text-yellow-400 font-bold">Note moyenne : {stats.avgRating} / 5</p>
              <p className="text-slate-400 text-xs">Évaluation de l'admin</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 mt-5 space-y-5">
        {/* Live match */}
        {liveMatch && (
          <div className="bg-red-600 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/30 animate-pulse"/>
            <div className="relative">
              <p className="text-red-200 text-xs font-bold uppercase mb-1">● Match en cours</p>
              <p className="text-white font-black text-lg">A {liveMatch.scoreA} – {liveMatch.scoreB} B</p>
              <p className="text-red-200 text-sm">{formatDate(liveMatch.date)}</p>
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-white font-bold text-lg mb-3">Prochain match</h2>
            {upcoming.map(m => (
              <Link key={m.id} to={`/player/match/${m.id}`} className="flex items-center justify-between bg-slate-800 rounded-2xl p-4">
                <div>
                  <p className="text-white font-semibold">{formatDate(m.date)}</p>
                  <p className="text-slate-400 text-sm">{m.teamA.length + m.teamB.length} joueurs · {m.formKeyA||''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-600 text-slate-200 text-xs px-2 py-0.5 rounded-full">Prévu</span>
                  <ChevronRight size={16} className="text-slate-500"/>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Recent results */}
        {recent.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white font-bold text-lg">Mes derniers matchs</h2>
              <Link to="/player/matches" className="text-green-400 text-sm">Tout voir</Link>
            </div>
            <div className="space-y-2">
              {recent.map(m => {
                const myTeam = getMyTeam(m);
                const won = didWin(m);
                const drew = m.scoreA === m.scoreB;
                const myGoals = m.goals.filter(g => g.playerId === player.id).length;
                const adminRating = m.ratings?.[player.id];
                return (
                  <Link key={m.id} to={`/player/match/${m.id}`} className="flex items-center gap-3 bg-slate-800 rounded-2xl px-4 py-3">
                    <div className={`w-2 h-10 rounded-full flex-shrink-0 ${won?'bg-green-500':drew?'bg-yellow-500':'bg-red-500'}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-xs capitalize">{formatDate(m.date)}</p>
                      <p className="text-white font-bold">
                        <span className="text-green-400">A</span> {m.scoreA} – {m.scoreB} <span className="text-blue-400">B</span>
                        <span className={`ml-2 text-xs ${myTeam==='A'?'text-green-400':'text-blue-400'}`}>(Éq.{myTeam})</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {myGoals > 0 && <p className="text-green-400 text-xs font-bold">{myGoals} ⚽</p>}
                      {adminRating > 0 && <p className="text-yellow-400 text-xs">{'★'.repeat(adminRating)}{'☆'.repeat(5-adminRating)}</p>}
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
            <p className="text-5xl mb-3">⚽</p>
            <p className="text-white font-bold text-lg">Aucun match joué</p>
            <p className="text-slate-400 text-sm mt-1">Tu apparaîtras ici dès que l'admin t'assigne à un match</p>
          </div>
        )}
      </div>
    </div>
  );
}
