import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Calendar, ChevronRight, Trash2 } from 'lucide-react';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUS_TABS = ['Tous', 'Prévu', 'Live', 'Terminé'];
const statusMap = { 'Prévu': 'scheduled', 'Live': 'live', 'Terminé': 'finished' };

export default function Matches() {
  const { matches, deleteMatch } = useApp();
  const [tab, setTab] = useState('Tous');
  const [confirm, setConfirm] = useState(null);

  const filtered = matches
    .filter(m => tab === 'Tous' || m.status === statusMap[tab])
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = (e, id) => {
    e.preventDefault();
    if (confirm === id) {
      deleteMatch(id);
      setConfirm(null);
    } else {
      setConfirm(id);
      setTimeout(() => setConfirm(null), 3000);
    }
  };

  const statusBadge = (status) => {
    const cfg = {
      live: 'bg-red-500 text-white',
      scheduled: 'bg-slate-600 text-slate-200',
      finished: 'bg-green-900 text-green-300',
    };
    const label = { live: '● LIVE', scheduled: 'Prévu', finished: 'Terminé' };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg[status]}`}>{label[status]}</span>;
  };

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      <div className="bg-slate-900 px-4 pt-10 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Matchs</h1>
            <p className="text-slate-400 text-sm mt-0.5">{matches.length} match{matches.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/matches/new" className="bg-green-600 text-white p-3 rounded-2xl">
            <Plus size={20} />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {STATUS_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === t ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Calendar size={48} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">Aucun match {tab !== 'Tous' ? tab.toLowerCase() : ''}</p>
            <Link to="/matches/new" className="inline-block mt-4 bg-green-600 text-white px-5 py-3 rounded-2xl font-semibold text-sm">
              Créer un match
            </Link>
          </div>
        )}

        {filtered.map(m => (
          <Link key={m.id} to={m.status === 'live' ? `/matches/${m.id}/live` : `/matches/${m.id}`} className="block">
            <div className="bg-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-400 text-xs capitalize">{formatDate(m.date)}</p>
                <div className="flex items-center gap-2">
                  {statusBadge(m.status)}
                  <button
                    onClick={(e) => handleDelete(e, m.id)}
                    className={`p-1 rounded-lg -mr-1 transition-colors ${confirm === m.id ? 'text-red-400' : 'text-slate-600'}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <p className="text-green-400 font-bold text-sm">Équipe A</p>
                  {m.status !== 'scheduled' && (
                    <p className="text-white text-3xl font-black mt-1">{m.scoreA}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-1">{m.teamA.length} joueurs</p>
                </div>
                <div className="px-4 text-slate-500 font-bold text-lg">
                  {m.status === 'scheduled' ? 'VS' : '–'}
                </div>
                <div className="flex-1 text-center">
                  <p className="text-blue-400 font-bold text-sm">Équipe B</p>
                  {m.status !== 'scheduled' && (
                    <p className="text-white text-3xl font-black mt-1">{m.scoreB}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-1">{m.teamB.length} joueurs</p>
                </div>
              </div>

              {m.isRecurring && (
                <p className="text-center text-slate-500 text-xs mt-2">🔁 Récurrent ({m.recurringDay === 'monday' ? 'Lundi' : 'Jeudi'})</p>
              )}

              <div className="flex justify-center mt-2">
                <ChevronRight size={16} className="text-slate-600" />
              </div>

              {confirm === m.id && (
                <p className="text-red-400 text-xs text-center mt-2">Appuyez encore pour supprimer</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
