import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Target, Shield, Star, Award } from 'lucide-react';

export default function Stats() {
  const { getTopScorers, players, matches, getPlayerStats } = useApp();
  const [tab, setTab] = useState('buteurs');

  const topScorers = getTopScorers();
  const finished = matches.filter(m => m.status === 'finished');
  const totalGoals = finished.reduce((s, m) => s + m.scoreA + m.scoreB, 0);
  const avgGoals = finished.length ? (totalGoals / finished.length).toFixed(1) : 0;

  const motmCounts = {};
  finished.forEach(m => {
    if (m.manOfMatch) motmCounts[m.manOfMatch] = (motmCounts[m.manOfMatch] || 0) + 1;
  });
  const motmRanking = Object.entries(motmCounts)
    .map(([id, count]) => ({ player: players.find(p => p.id === id), count }))
    .filter(x => x.player)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      <div className="bg-slate-900 px-4 pt-10 pb-5">
        <h1 className="text-2xl font-bold text-white">Statistiques</h1>
        <p className="text-slate-400 text-sm mt-1">{finished.length} match{finished.length !== 1 ? 's' : ''} terminé{finished.length !== 1 ? 's' : ''}</p>

        {/* Global stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Matchs', value: finished.length, icon: '📅' },
            { label: 'Buts', value: totalGoals, icon: '⚽' },
            { label: 'Moy. buts', value: avgGoals, icon: '📊' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-slate-800 rounded-2xl p-3 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {[
          { id: 'buteurs', label: '⚽ Buteurs' },
          { id: 'motm', label: '⭐ Homme du match' },
          { id: 'joueurs', label: '👤 Joueurs' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${tab === t.id ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4">
        {tab === 'buteurs' && (
          <div>
            {topScorers.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">⚽</p>
                <p className="text-slate-400">Aucun buteur enregistré</p>
              </div>
            )}
            <div className="space-y-2">
              {topScorers.map((s, i) => (
                <div key={s.player.id} className="bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-yellow-500 text-white' :
                    i === 1 ? 'bg-slate-400 text-slate-900' :
                    i === 2 ? 'bg-orange-700 text-white' :
                    'bg-slate-700 text-slate-300'
                  }`}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{s.player.name}</p>
                    <p className="text-slate-400 text-xs">{getPlayerStats(s.player.id).matchesPlayed} matchs joués</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-black text-xl">{s.goals}</p>
                    <p className="text-slate-500 text-xs">buts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'motm' && (
          <div>
            {motmRanking.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">⭐</p>
                <p className="text-slate-400">Aucun homme du match désigné</p>
              </div>
            )}
            <div className="space-y-2">
              {motmRanking.map((s, i) => (
                <div key={s.player.id} className="bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>{i + 1}</span>
                  <p className="flex-1 text-white font-semibold">{s.player.name}</p>
                  <div className="text-right">
                    <p className="text-yellow-400 font-black text-xl">{s.count} ⭐</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'joueurs' && (
          <div className="space-y-2">
            {players.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-400">Aucun joueur</p>
              </div>
            )}
            {players
              .map(p => ({ ...p, stats: getPlayerStats(p.id) }))
              .sort((a, b) => b.stats.goals - a.stats.goals)
              .map(p => (
                <div key={p.id} className="bg-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold">
                      {p.name[0].toUpperCase()}
                    </div>
                    <p className="text-white font-semibold flex-1">{p.name}</p>
                    {p.stats.motm > 0 && <span className="text-yellow-400 text-sm">{p.stats.motm} ⭐</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Matchs', value: p.stats.matchesPlayed },
                      { label: 'Buts', value: p.stats.goals },
                      { label: 'Victoires', value: p.stats.wins },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-700/50 rounded-xl py-2">
                        <p className="text-white font-bold">{value}</p>
                        <p className="text-slate-400 text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
