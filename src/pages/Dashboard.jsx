import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, Users, Trophy, Plus, LogOut, ChevronRight, Flame } from 'lucide-react';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function StatusBadge({ status }) {
  const cfg = {
    live: 'bg-red-500 text-white animate-pulse',
    scheduled: 'bg-slate-600 text-slate-200',
    finished: 'bg-green-900 text-green-300',
  };
  const label = { live: '● Live', scheduled: 'Prévu', finished: 'Terminé' };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg[status]}`}>{label[status]}</span>;
}

export default function Dashboard() {
  const { matches, players, getTopScorers, logout } = useApp();
  const navigate = useNavigate();

  const liveMatch = matches.find(m => m.status === 'live');
  const upcoming = matches
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
  const recent = matches
    .filter(m => m.status === 'finished')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  const topScorers = getTopScorers().slice(0, 3);
  const finishedCount = matches.filter(m => m.status === 'finished').length;
  const totalGoals = matches.filter(m => m.status === 'finished').reduce((s, m) => s + m.scoreA + m.scoreB, 0);

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 px-4 pt-10 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm">Bienvenue 👋</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">FootManager</h1>
          </div>
          <button onClick={logout} className="text-slate-400 p-2">
            <LogOut size={20} />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Matchs', value: finishedCount, icon: Calendar },
            { label: 'Joueurs', value: players.length, icon: Users },
            { label: 'Buts', value: totalGoals, icon: Trophy },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-slate-800 rounded-2xl p-3 text-center">
              <Icon size={18} className="text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-6 mt-5">
        {/* Live match */}
        {liveMatch && (
          <button
            onClick={() => navigate(`/matches/${liveMatch.id}/live`)}
            className="w-full bg-red-600 rounded-2xl p-4 text-left relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse" />
            <div className="relative">
              <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-2">● Match en cours</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-bold text-lg">Équipe A  {liveMatch.scoreA} – {liveMatch.scoreB}  Équipe B</p>
                  <p className="text-red-200 text-sm mt-0.5">{formatDate(liveMatch.date)}</p>
                </div>
                <ChevronRight size={24} className="text-red-200" />
              </div>
            </div>
          </button>
        )}

        {/* Quick add */}
        <Link
          to="/matches/new"
          className="flex items-center gap-3 bg-green-600 hover:bg-green-500 active:bg-green-700 rounded-2xl p-4 transition-colors"
        >
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Plus size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold">Créer un match</p>
            <p className="text-green-200 text-sm">Lundi, jeudi ou date libre</p>
          </div>
        </Link>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white font-bold text-lg">Prochains matchs</h2>
              <Link to="/matches" className="text-green-400 text-sm">Voir tout</Link>
            </div>
            <div className="space-y-2">
              {upcoming.map(m => (
                <Link key={m.id} to={`/matches/${m.id}`} className="flex items-center justify-between bg-slate-800 rounded-2xl p-4">
                  <div>
                    <p className="text-white font-semibold">{formatDate(m.date)}</p>
                    <p className="text-slate-400 text-sm">{m.teamA.length + m.teamB.length} joueurs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={m.status} />
                    <ChevronRight size={16} className="text-slate-500" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent results */}
        {recent.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white font-bold text-lg">Derniers résultats</h2>
              <Link to="/matches" className="text-green-400 text-sm">Historique</Link>
            </div>
            <div className="space-y-2">
              {recent.map(m => (
                <Link key={m.id} to={`/matches/${m.id}`} className="flex items-center justify-between bg-slate-800 rounded-2xl p-4">
                  <p className="text-slate-400 text-sm">{formatDate(m.date)}</p>
                  <p className="text-white font-bold text-lg">
                    <span className="text-green-400">A</span> {m.scoreA} – {m.scoreB} <span className="text-blue-400">B</span>
                  </p>
                  <ChevronRight size={16} className="text-slate-500" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top scorers */}
        {topScorers.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <Flame size={20} className="text-orange-400" /> Top buteurs
              </h2>
              <Link to="/stats" className="text-green-400 text-sm">Voir tout</Link>
            </div>
            <div className="bg-slate-800 rounded-2xl overflow-hidden">
              {topScorers.map((s, i) => (
                <div key={s.player.id} className={`flex items-center px-4 py-3 ${i < topScorers.length - 1 ? 'border-b border-slate-700' : ''}`}>
                  <span className={`w-6 font-bold text-sm mr-3 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : 'text-orange-400'}`}>{i + 1}</span>
                  <span className="flex-1 text-white font-medium">{s.player.name}</span>
                  <span className="text-green-400 font-bold">{s.goals} ⚽</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {players.length === 0 && matches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">⚽</p>
            <p className="text-white font-bold text-xl">Bienvenue !</p>
            <p className="text-slate-400 mt-2">Commencez par ajouter des joueurs</p>
            <Link to="/players" className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold">
              Ajouter des joueurs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
