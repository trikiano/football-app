import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Trash2, Search, ChevronDown, Link, Phone, Lock } from 'lucide-react';

export const POSITIONS = {
  GK:  { label: 'Gardien',   short: 'GK',  icon: '🧤', color: 'bg-yellow-500' },
  DEF: { label: 'Défenseur', short: 'DEF', icon: '🛡️', color: 'bg-blue-500'   },
  MID: { label: 'Milieu',    short: 'MIL', icon: '⚙️', color: 'bg-purple-500' },
  ATT: { label: 'Attaquant', short: 'ATT', icon: '⚡', color: 'bg-red-500'    },
};

export function PosBadge({ pos, small }) {
  const cfg = POSITIONS[pos] || POSITIONS.MID;
  return (
    <span className={`${cfg.color} text-white font-bold rounded-md px-1.5 ${small ? 'text-[10px] py-0.5' : 'text-xs py-1'}`}>
      {cfg.short}
    </span>
  );
}

function PlayerCard({ player, stats, onDelete, confirm, onPositionChange, editPos, setEditPos }) {
  const { updatePlayer } = useApp();
  const cfg = POSITIONS[player.position] || POSITIONS.MID;
  const [showDetails, setShowDetails] = useState(false);
  const [phone, setPhone] = useState(player.phone || '');
  const [pin, setPin] = useState(player.pin || '');
  const [copied, setCopied] = useState(false);

  const saveCredentials = () => {
    updatePlayer(player.id, { phone: phone.trim(), pin: pin.trim() });
  };

  const shareLink = () => {
    const base = window.location.origin + window.location.pathname;
    const url = `${base}?join=${encodeURIComponent(phone.trim())}`;
    if (navigator.share) {
      navigator.share({ title: 'FootManager', text: `Rejoins FootManager ! PIN: ${pin}`, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {player.photo ? (
            <img src={player.photo} alt="" className="w-11 h-11 rounded-full object-cover border border-white/20"/>
          ) : (
            <div className={`w-11 h-11 rounded-full ${cfg.color} flex items-center justify-center text-white font-bold text-lg`}>
              {player.name[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold">{player.name}</p>
              <PosBadge pos={player.position} small />
              {player.phone && <span className="text-green-400 text-[10px]">●</span>}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {stats.matchesPlayed > 0 ? (
                <>
                  <span className="text-slate-400 text-xs">{stats.matchesPlayed} matchs</span>
                  <span className="text-green-400 text-xs">{stats.goals} ⚽</span>
                  {stats.motm > 0 && <span className="text-yellow-400 text-xs">⭐×{stats.motm}</span>}
                </>
              ) : (
                <span className="text-slate-500 text-xs">Nouveau</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowDetails(!showDetails)} className="p-2 text-slate-400 text-xs font-bold">
            {showDetails ? '▲' : '▼'}
          </button>
          <div className="relative">
            <button onClick={() => setEditPos(editPos === player.id ? null : player.id)} className="p-2 text-slate-500">
              <ChevronDown size={16} />
            </button>
            {editPos === player.id && (
              <div className="absolute right-0 top-9 bg-slate-700 rounded-xl shadow-xl z-20 overflow-hidden w-36">
                {Object.entries(POSITIONS).map(([key, c]) => (
                  <button key={key} onClick={() => { onPositionChange(player.id, key); setEditPos(null); }}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-600 transition-colors ${player.position === key ? 'text-green-400 font-bold' : 'text-slate-200'}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onDelete(player.id)}
            className={`p-2 rounded-xl transition-colors ${confirm === player.id ? 'bg-red-600 text-white' : 'text-slate-500'}`}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {confirm === player.id && (
        <p className="text-red-400 text-xs mt-2 text-center">Appuyez encore pour confirmer</p>
      )}

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
                placeholder="Numéro de téléphone"
                className="w-full bg-slate-700 text-white pl-8 pr-3 py-2 rounded-xl border border-slate-600 focus:border-green-500 outline-none text-sm"/>
            </div>
            <div className="relative w-24">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,''))} type="tel"
                maxLength={6} placeholder="PIN"
                className="w-full bg-slate-700 text-white pl-8 pr-3 py-2 rounded-xl border border-slate-600 focus:border-green-500 outline-none text-sm text-center tracking-widest font-bold"/>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveCredentials} disabled={!phone.trim() || pin.length < 4}
              className="flex-1 bg-green-600 disabled:opacity-40 text-white py-2 rounded-xl text-sm font-bold">
              Enregistrer
            </button>
            <button onClick={shareLink} disabled={!phone.trim() || pin.length < 4}
              className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-200 disabled:opacity-40'}`}>
              <Link size={14}/>{copied ? 'Copié !' : 'Envoyer lien'}
            </button>
          </div>
          {player.phone && (
            <p className="text-slate-500 text-xs text-center">📱 {player.phone} · PIN enregistré</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Players() {
  const { players, addPlayer, updatePlayer, removePlayer, getPlayerStats } = useApp();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('MID');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [editPos, setEditPos] = useState(null);

  const filtered = players
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const order = ['GK', 'DEF', 'MID', 'ATT'];
      return order.indexOf(a.position) - order.indexOf(b.position) || a.name.localeCompare(b.name);
    });

  const handleAdd = (e) => {
    e.preventDefault();
    if (name.trim() && !players.find(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      addPlayer(name.trim(), position);
      setName('');
    }
  };

  const handleDelete = (id) => {
    if (confirm === id) { removePlayer(id); setConfirm(null); }
    else { setConfirm(id); setTimeout(() => setConfirm(null), 3000); }
  };

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      <div className="bg-slate-900 px-4 pt-10 pb-5">
        <h1 className="text-2xl font-bold text-white">Joueurs</h1>
        <p className="text-slate-400 text-sm mt-1">{players.length} joueur{players.length !== 1 ? 's' : ''}</p>

        <form onSubmit={handleAdd} className="mt-4 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du joueur"
            className="w-full bg-slate-800 text-white px-4 py-3 rounded-2xl outline-none border border-slate-700 focus:border-green-500 transition-colors"/>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(POSITIONS).map(([key, cfg]) => (
              <button key={key} type="button" onClick={() => setPosition(key)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-colors flex flex-col items-center gap-0.5 ${position === key ? `${cfg.color} text-white` : 'bg-slate-800 text-slate-400'}`}>
                <span className="text-lg">{cfg.icon}</span>
                <span className="text-[11px]">{cfg.short}</span>
              </button>
            ))}
          </div>
          <button type="submit" disabled={!name.trim()}
            className="w-full bg-green-600 disabled:opacity-40 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
            <UserPlus size={18} /> Ajouter
          </button>
        </form>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {players.length > 4 && (
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-2xl outline-none border border-slate-700 focus:border-green-500 text-sm"/>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">👤</p>
            <p className="text-slate-400">{search ? 'Aucun résultat' : 'Aucun joueur ajouté'}</p>
          </div>
        )}

        {filtered.map(player => (
          <PlayerCard key={player.id} player={player} stats={getPlayerStats(player.id)}
            onDelete={handleDelete} confirm={confirm}
            onPositionChange={(id, key) => updatePlayer(id, { position: key })}
            editPos={editPos} setEditPos={setEditPos}/>
        ))}
      </div>
    </div>
  );
}
