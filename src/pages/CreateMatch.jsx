import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Check, X, Shuffle, Plus } from 'lucide-react';
import FootballPitch from '../components/FootballPitch';
import { POSITIONS } from './Players';

function nextWeekday(day) {
  const now = new Date();
  const target = day === 'monday' ? 1 : 4;
  const diff = (target - now.getDay() + 7) % 7 || 7;
  const d = new Date(now); d.setDate(d.getDate() + diff); d.setHours(20, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

const FORMATIONS_BY_SIZE = {
  5: [
    { key: '2-1-1', DEF: 2, MID: 1, ATT: 1 },
    { key: '1-2-1', DEF: 1, MID: 2, ATT: 1 },
    { key: '2-0-2', DEF: 2, MID: 0, ATT: 2 },
    { key: '1-1-2', DEF: 1, MID: 1, ATT: 2 },
  ],
  6: [
    { key: '2-2-1', DEF: 2, MID: 2, ATT: 1 },
    { key: '2-1-2', DEF: 2, MID: 1, ATT: 2 },
    { key: '1-2-2', DEF: 1, MID: 2, ATT: 2 },
    { key: '3-1-1', DEF: 3, MID: 1, ATT: 1 },
    { key: '1-3-1', DEF: 1, MID: 3, ATT: 1 },
  ],
  7: [
    { key: '2-3-1', DEF: 2, MID: 3, ATT: 1 },
    { key: '2-2-2', DEF: 2, MID: 2, ATT: 2 },
    { key: '3-2-1', DEF: 3, MID: 2, ATT: 1 },
    { key: '1-3-2', DEF: 1, MID: 3, ATT: 2 },
    { key: '3-1-2', DEF: 3, MID: 1, ATT: 2 },
    { key: '2-1-3', DEF: 2, MID: 1, ATT: 3 },
  ],
  8: [
    { key: '3-3-1', DEF: 3, MID: 3, ATT: 1 },
    { key: '3-2-2', DEF: 3, MID: 2, ATT: 2 },
    { key: '4-2-1', DEF: 4, MID: 2, ATT: 1 },
    { key: '2-4-1', DEF: 2, MID: 4, ATT: 1 },
    { key: '2-3-2', DEF: 2, MID: 3, ATT: 2 },
  ],
};

function makeEmptyFormation(fDef) {
  return {
    GK:  [null],
    DEF: Array(fDef.DEF).fill(null),
    MID: Array(fDef.MID).fill(null),
    ATT: Array(fDef.ATT).fill(null),
  };
}
function flattenFormation(f) {
  return [...f.GK, ...f.DEF, ...f.MID, ...f.ATT].filter(Boolean);
}
function getFDef(size, key) {
  const list = FORMATIONS_BY_SIZE[size] || FORMATIONS_BY_SIZE[7];
  return list.find(f => f.key === key) || list[0];
}

export default function CreateMatch() {
  const { players, createMatch, getPlayer } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [dateMode, setDateMode] = useState('monday');
  const [customDate, setCustomDate] = useState(() => { const d = new Date(); d.setHours(20,0,0,0); return d.toISOString().slice(0,16); });
  const [isRecurring, setIsRecurring] = useState(false);

  const [teamSize, setTeamSize] = useState(7);
  const [formKeyA, setFormKeyA] = useState('2-3-1');
  const [formKeyB, setFormKeyB] = useState('2-3-1');
  const [formationA, setFormationA] = useState(() => makeEmptyFormation({ DEF:2, MID:3, ATT:1 }));
  const [formationB, setFormationB] = useState(() => makeEmptyFormation({ DEF:2, MID:3, ATT:1 }));
  const [subsA, setSubsA] = useState([]);
  const [subsB, setSubsB] = useState([]);

  const [modal, setModal] = useState(null); // { team, pos, idx } or { team, isSub: true }
  const [modalSearch, setModalSearch] = useState('');

  const formListA = FORMATIONS_BY_SIZE[teamSize] || FORMATIONS_BY_SIZE[7];
  const formListB = FORMATIONS_BY_SIZE[teamSize] || FORMATIONS_BY_SIZE[7];
  const fDefA = getFDef(teamSize, formKeyA);
  const fDefB = getFDef(teamSize, formKeyB);

  // Reset when teamSize changes
  useEffect(() => {
    const defA = (FORMATIONS_BY_SIZE[teamSize] || FORMATIONS_BY_SIZE[7])[0];
    const defB = (FORMATIONS_BY_SIZE[teamSize] || FORMATIONS_BY_SIZE[7])[0];
    setFormKeyA(defA.key); setFormKeyB(defB.key);
    setFormationA(makeEmptyFormation(defA)); setFormationB(makeEmptyFormation(defB));
    setSubsA([]); setSubsB([]);
  }, [teamSize]);

  useEffect(() => {
    setFormationA(makeEmptyFormation(getFDef(teamSize, formKeyA)));
  }, [formKeyA]);
  useEffect(() => {
    setFormationB(makeEmptyFormation(getFDef(teamSize, formKeyB)));
  }, [formKeyB]);

  const assignedIds = () => new Set([...flattenFormation(formationA), ...flattenFormation(formationB), ...subsA, ...subsB]);

  const handleSlotClick = (team, pos, idx) => { setModal({ team, pos, idx, isSub: false }); setModalSearch(''); };
  const handleSlotRemove = (team, pos, idx) => {
    const setter = team === 'A' ? setFormationA : setFormationB;
    setter(prev => { const n = { ...prev, [pos]: [...prev[pos]] }; n[pos][idx] = null; return n; });
  };
  const handleSubAdd = (team) => { setModal({ team, isSub: true }); setModalSearch(''); };
  const handleSubRemove = (team, id) => {
    if (team === 'A') setSubsA(p => p.filter(x => x !== id));
    else setSubsB(p => p.filter(x => x !== id));
  };

  const assignPlayer = (playerId) => {
    if (!modal) return;
    if (modal.isSub) {
      if (modal.team === 'A') setSubsA(p => [...p, playerId]);
      else setSubsB(p => [...p, playerId]);
    } else {
      const setter = modal.team === 'A' ? setFormationA : setFormationB;
      setter(prev => { const n = { ...prev, [modal.pos]: [...prev[modal.pos]] }; n[modal.pos][modal.idx] = playerId; return n; });
    }
    setModal(null);
  };

  const shuffleTeams = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);
    const fill = (pList, fDef) => {
      const f = makeEmptyFormation(fDef);
      const byPos = { GK: [], DEF: [], MID: [], ATT: [] };
      pList.forEach(p => { (byPos[p.position] || byPos.MID).push(p.id); });
      const overflow = [];
      ['GK','DEF','MID','ATT'].forEach(pos => {
        const pool = byPos[pos];
        f[pos].forEach((_, i) => { if (pool[i]) f[pos][i] = pool[i]; });
        if (pool.length > f[pos].length) overflow.push(...pool.slice(f[pos].length));
      });
      let oi = 0;
      ['MID','DEF','ATT','GK'].forEach(pos => { f[pos].forEach((v, i) => { if (!v && oi < overflow.length) f[pos][i] = overflow[oi++]; }); });
      return f;
    };
    setFormationA(fill(shuffled.slice(0, half), fDefA));
    setFormationB(fill(shuffled.slice(half), fDefB));
    setSubsA([]); setSubsB([]);
  };

  const handleCreate = () => {
    createMatch({
      date: new Date(dateMode === 'custom' ? customDate : nextWeekday(dateMode)).toISOString(),
      isRecurring, recurringDay: dateMode !== 'custom' ? dateMode : null,
      teamSize, formKeyA, formKeyB,
      teamA: flattenFormation(formationA),
      teamB: flattenFormation(formationB),
      formationA, formationB, subsA, subsB,
    });
    navigate('/matches');
  };

  const totalAssigned = flattenFormation(formationA).length + flattenFormation(formationB).length + subsA.length + subsB.length;
  const available = players.filter(p => !assignedIds().has(p.id) && (!modalSearch || p.name.toLowerCase().includes(modalSearch.toLowerCase())));
  const modalSorted = modal ? [...available.filter(p => !modal.isSub && p.position === modal.pos), ...available.filter(p => modal.isSub || p.position !== modal.pos)] : [];

  // ── Step 1 ──
  if (step === 1) return (
    <div className="pb-24 min-h-screen bg-slate-950">
      <div className="bg-slate-900 px-4 pt-10 pb-5">
        <button onClick={() => navigate(-1)} className="text-slate-400 mb-4"><ArrowLeft size={24}/></button>
        <h1 className="text-2xl font-bold text-white">Nouveau match</h1>
        <p className="text-slate-400 text-sm mt-1">Étape 1 / 2 — Date</p>
      </div>
      <div className="px-4 mt-5 space-y-3">
        {[
          { id: 'monday',   label: '⚽ Lundi',      sub: new Date(nextWeekday('monday')).toLocaleDateString('fr-FR', {day:'numeric',month:'long'}) },
          { id: 'thursday', label: '⚽ Jeudi',      sub: new Date(nextWeekday('thursday')).toLocaleDateString('fr-FR', {day:'numeric',month:'long'}) },
          { id: 'custom',   label: '📅 Autre date', sub: 'Choisir librement' },
        ].map(opt => (
          <button key={opt.id} onClick={() => setDateMode(opt.id)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${dateMode===opt.id?'border-green-500 bg-green-900/20':'border-slate-700 bg-slate-800'}`}>
            <p className="text-white font-semibold">{opt.label}</p>
            <p className="text-slate-400 text-sm">{opt.sub}</p>
          </button>
        ))}
        {dateMode === 'custom' && (
          <input type="datetime-local" value={customDate} onChange={e => setCustomDate(e.target.value)}
            className="w-full bg-slate-800 text-white px-4 py-3 rounded-2xl border border-slate-700 focus:border-green-500 outline-none"/>
        )}
        {dateMode !== 'custom' && (
          <button onClick={() => setIsRecurring(!isRecurring)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${isRecurring?'border-green-500 bg-green-900/20':'border-slate-700 bg-slate-800'}`}>
            <div>
              <p className="text-white font-semibold text-left">🔁 Match récurrent</p>
              <p className="text-slate-400 text-sm">Créer automatiquement chaque semaine</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isRecurring?'border-green-500 bg-green-500':'border-slate-600'}`}>
              {isRecurring && <Check size={14} className="text-white"/>}
            </div>
          </button>
        )}
        <button onClick={() => setStep(2)} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold mt-2">
          Suivant → Composer les équipes
        </button>
      </div>
    </div>
  );

  // ── Step 2 ──
  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      <div className="bg-slate-900 px-4 pt-8 pb-3">
        <button onClick={() => setStep(1)} className="text-slate-400 mb-2"><ArrowLeft size={22}/></button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Composition</h1>
            <p className="text-slate-400 text-xs">{totalAssigned} joueur{totalAssigned!==1?'s':''} placé{totalAssigned!==1?'s':''}</p>
          </div>
          <button onClick={shuffleTeams} className="flex items-center gap-1.5 bg-slate-700 px-3 py-2 rounded-xl text-slate-200 text-sm font-medium">
            <Shuffle size={14}/> Mélanger
          </button>
        </div>

        {/* Team size */}
        <div className="mt-3">
          <p className="text-slate-400 text-xs mb-1.5 font-semibold uppercase tracking-wide">Joueurs par équipe</p>
          <div className="flex gap-2">
            {[5,6,7,8].map(s => (
              <button key={s} onClick={() => setTeamSize(s)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${teamSize===s?'bg-green-600 text-white':'bg-slate-800 text-slate-400'}`}>
                {s}v{s}
              </button>
            ))}
          </div>
        </div>

        {/* Formations per team */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {/* Team A formation */}
          <div>
            <p className="text-green-400 text-xs font-bold mb-1.5 flex items-center gap-1">⚽ Éq. A</p>
            <div className="flex flex-wrap gap-1">
              {formListA.map(f => (
                <button key={f.key} onClick={() => setFormKeyA(f.key)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${formKeyA===f.key?'bg-green-600 text-white':'bg-slate-800 text-slate-400'}`}>
                  {f.key}
                </button>
              ))}
            </div>
          </div>
          {/* Team B formation */}
          <div>
            <p className="text-blue-400 text-xs font-bold mb-1.5 flex items-center gap-1">⚽ Éq. B</p>
            <div className="flex flex-wrap gap-1">
              {formListB.map(f => (
                <button key={f.key} onClick={() => setFormKeyB(f.key)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${formKeyB===f.key?'bg-blue-600 text-white':'bg-slate-800 text-slate-400'}`}>
                  {f.key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pitch */}
      <div className="px-3 mt-3">
        <FootballPitch
          formationA={formationA} formationB={formationB}
          getPlayer={getPlayer}
          onSlotClick={handleSlotClick} onSlotRemove={handleSlotRemove}
          formationDefA={fDefA} formationDefB={fDefB}
        />
      </div>

      {/* Substitutes */}
      <div className="px-4 mt-4 space-y-3">
        {[
          { team: 'A', subs: subsA, color: 'text-green-400', bg: 'bg-green-800' },
          { team: 'B', subs: subsB, color: 'text-blue-400',  bg: 'bg-blue-800'  },
        ].map(({ team, subs, color, bg }) => (
          <div key={team} className="bg-slate-800 rounded-2xl p-3">
            <p className={`${color} text-xs font-bold mb-2`}>Remplaçants — Équipe {team}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {subs.map(id => {
                const p = getPlayer(id);
                if (!p) return null;
                const cfg = POSITIONS[p.position] || POSITIONS.MID;
                return (
                  <div key={id} className="flex flex-col items-center gap-0.5 relative">
                    <button onClick={() => handleSubRemove(team, id)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center z-10">
                      <X size={9} className="text-white"/>
                    </button>
                    <div className={`w-9 h-9 rounded-full ${bg} border-2 border-white/20 flex items-center justify-center text-white font-bold text-sm`}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className="text-white text-[9px] truncate max-w-[36px] text-center">{p.name.split(' ')[0]}</span>
                    <span className={`${cfg.color} text-white text-[7px] font-bold px-1 rounded-sm`}>{cfg.short}</span>
                  </div>
                );
              })}
              <button onClick={() => handleSubAdd(team)}
                className="w-9 h-9 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center bg-slate-700/50 text-slate-500">
                <Plus size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-4">
        <button onClick={handleCreate} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base">
          Créer le match ✓
        </button>
      </div>

      {/* Player picker modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setModal(null)}>
          <div className="bg-slate-900 w-full rounded-t-3xl p-5 pb-10 max-h-[72vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-white font-bold text-lg">
                  {modal.isSub ? '🔄 Remplaçant' : `${POSITIONS[modal.pos]?.icon} ${POSITIONS[modal.pos]?.label}`}
                </h3>
                <p className="text-slate-400 text-xs">Équipe {modal.team}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-slate-400"><X size={22}/></button>
            </div>
            <input value={modalSearch} onChange={e => setModalSearch(e.target.value)}
              placeholder="Rechercher..." autoFocus
              className="w-full bg-slate-800 text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:border-green-500 outline-none text-sm mb-3"/>
            <div className="overflow-y-auto space-y-1.5 flex-1">
              {modalSorted.length === 0 && <p className="text-center text-slate-500 py-6">Aucun joueur disponible</p>}
              {modalSorted.map(p => {
                const pcfg = POSITIONS[p.position] || POSITIONS.MID;
                const preferred = !modal.isSub && p.position === modal.pos;
                return (
                  <button key={p.id} onClick={() => assignPlayer(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${preferred?'bg-slate-700 border border-green-600/50':'bg-slate-800'}`}>
                    <div className={`w-9 h-9 rounded-full ${pcfg.color} flex items-center justify-center text-white font-bold shrink-0`}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <p className="text-white font-medium text-sm flex-1">{p.name}</p>
                    <span className={`${pcfg.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0`}>{pcfg.short}</span>
                    {preferred && <span className="text-green-400 text-xs shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
