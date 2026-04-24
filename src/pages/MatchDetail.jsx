import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Play, Star, Award, Share2, Download, X } from 'lucide-react';
import MatchSheet from '../components/MatchSheet';
import { toPng } from 'html-to-image';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => onChange(s)} className="transition-transform active:scale-90">
          <Star size={24} className={s <= value ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
        </button>
      ))}
    </div>
  );
}

export default function MatchDetail() {
  const { id } = useParams();
  const { matches, players, getPlayer, updateMatch, startMatch } = useApp();
  const navigate = useNavigate();
  const match = matches.find(m => m.id === id);
  const [tab, setTab] = useState('résumé');
  const [notes, setNotes] = useState(match?.notes || '');
  const [showSheet, setShowSheet] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sheetRef = useRef(null);

  if (!match) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400">Match introuvable</p>
    </div>
  );

  const allPlayers = [...match.teamA, ...match.teamB].map(pid => players.find(p => p.id === pid)).filter(Boolean);
  const goals = [...match.goals].sort((a, b) => a.minute - b.minute);

  const setRating = (playerId, val) => updateMatch(id, { ratings: { ...match.ratings, [playerId]: val } });
  const setMotm = (playerId) => updateMatch(id, { manOfMatch: match.manOfMatch === playerId ? null : playerId });
  const saveNotes = () => updateMatch(id, { notes });
  const handleStart = () => { startMatch(id); navigate(`/matches/${id}/live`); };

  const handleExport = async () => {
    if (!sheetRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(sheetRef.current, { cacheBust: true, pixelRatio: 2 });
      const matchDate = new Date(match.date).toLocaleDateString('fr-FR').replace(/\//g, '-');
      const filename = `match-${matchDate}.png`;

      // Try Web Share API (mobile / WhatsApp)
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Feuille de match ⚽' });
          setExporting(false);
          return;
        }
      }
      // Fallback: download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } catch (e) {
      console.error(e);
    }
    setExporting(false);
  };

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 px-4 pt-10 pb-5">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate(-1)} className="text-slate-400"><ArrowLeft size={24}/></button>
          <button
            onClick={() => setShowSheet(true)}
            className="flex items-center gap-1.5 bg-green-600 text-white text-sm font-bold px-3 py-2 rounded-xl"
          >
            <Share2 size={15}/> Exporter
          </button>
        </div>

        <p className="text-slate-400 text-xs capitalize mb-1">{formatDate(match.date)}</p>
        {match.formKeyA && (
          <div className="flex gap-2 mb-3">
            <span className="bg-green-900/50 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">A: {match.formKeyA}</span>
            <span className="bg-blue-900/50 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">B: {match.formKeyB}</span>
          </div>
        )}

        {/* Score */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex-1 text-center">
            <p className="text-green-400 font-bold">Équipe A</p>
            {match.status !== 'scheduled' && (
              <p className={`text-5xl font-black mt-1 ${match.scoreA > match.scoreB ? 'text-white' : 'text-slate-500'}`}>{match.scoreA}</p>
            )}
            <p className="text-slate-500 text-xs mt-1">{match.teamA.length} joueurs</p>
          </div>
          <div className="text-center px-4">
            {match.status === 'scheduled' ? <p className="text-slate-500 font-bold text-2xl">VS</p> : <p className="text-slate-600 font-bold text-2xl">–</p>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${
              match.status === 'live' ? 'bg-red-500 text-white' :
              match.status === 'finished' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-300'
            }`}>
              {match.status === 'live' ? '● LIVE' : match.status === 'finished' ? 'Terminé' : 'Prévu'}
            </span>
          </div>
          <div className="flex-1 text-center">
            <p className="text-blue-400 font-bold">Équipe B</p>
            {match.status !== 'scheduled' && (
              <p className={`text-5xl font-black mt-1 ${match.scoreB > match.scoreA ? 'text-white' : 'text-slate-500'}`}>{match.scoreB}</p>
            )}
            <p className="text-slate-500 text-xs mt-1">{match.teamB.length} joueurs</p>
          </div>
        </div>

        {match.manOfMatch && (
          <div className="mt-3 text-center">
            <p className="text-yellow-400 text-sm">⭐ Homme du match : <strong>{getPlayer(match.manOfMatch)?.name}</strong></p>
          </div>
        )}

        {match.status === 'scheduled' && (
          <button onClick={handleStart} className="w-full mt-4 bg-green-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Play size={18}/> Démarrer le match
          </button>
        )}
        {match.status === 'live' && (
          <Link to={`/matches/${id}/live`} className="block mt-4 bg-red-600 text-white py-3 rounded-2xl font-bold text-center">● Reprendre le live</Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mt-1">
        {['résumé','joueurs','notes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${tab===t?'text-green-400 border-b-2 border-green-400':'text-slate-500'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4">
        {tab === 'résumé' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[{team:'A',ids:match.teamA,subs:match.subsA||[],color:'green'},{team:'B',ids:match.teamB,subs:match.subsB||[],color:'blue'}].map(({team,ids,subs,color}) => (
                <div key={team} className={`bg-slate-800 rounded-2xl p-3 border border-${color}-900/50`}>
                  <p className={`text-${color}-400 font-bold text-sm mb-2 text-center`}>Équipe {team}</p>
                  {ids.map(pid => {
                    const p = getPlayer(pid); if (!p) return null;
                    const gls = match.goals.filter(g => g.playerId === pid).length;
                    return (
                      <div key={pid} className="text-slate-300 text-sm py-1 flex justify-between">
                        <span>{p.name}</span>
                        {gls > 0 && <span>{'⚽'.repeat(gls)}</span>}
                      </div>
                    );
                  })}
                  {subs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <p className="text-slate-500 text-xs mb-1">Remplaçants</p>
                      {subs.map(pid => { const p = getPlayer(pid); if (!p) return null; return <div key={pid} className="text-slate-500 text-xs py-0.5">🔄 {p.name}</div>; })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {goals.length > 0 && (
              <div>
                <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Buts</h3>
                <div className="space-y-2">
                  {goals.map(g => {
                    const scorer = g.playerId ? getPlayer(g.playerId) : null;
                    return (
                      <div key={g.id} className={`flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border-l-4 ${g.team==='A'?'border-green-500':'border-blue-500'}`}>
                        <span className="text-slate-400 text-sm w-8">{g.minute}'</span>
                        <span className="text-white flex-1">⚽ {scorer ? scorer.name : 'Inconnu'}</span>
                        <span className={`font-bold text-xs ${g.team==='A'?'text-green-400':'text-blue-400'}`}>Éq. {g.team}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'joueurs' && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">Note chaque joueur et désigne le meilleur</p>
            {allPlayers.map(p => {
              const isMotm = match.manOfMatch === p.id;
              const inTeam = match.teamA.includes(p.id) ? 'A' : 'B';
              return (
                <div key={p.id} className={`bg-slate-800 rounded-2xl p-4 ${isMotm?'ring-2 ring-yellow-400':''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${inTeam==='A'?'bg-green-700':'bg-blue-700'}`}>
                        {p.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{p.name}</p>
                        <p className={`text-xs ${inTeam==='A'?'text-green-400':'text-blue-400'}`}>Équipe {inTeam}</p>
                      </div>
                    </div>
                    <button onClick={() => setMotm(p.id)} className={`p-2 rounded-xl transition-colors ${isMotm?'bg-yellow-500 text-white':'bg-slate-700 text-slate-400'}`}>
                      <Award size={18}/>
                    </button>
                  </div>
                  <StarRating value={match.ratings[p.id]||0} onChange={val => setRating(p.id, val)}/>
                  {isMotm && <p className="text-yellow-400 text-xs mt-2">⭐ Homme du match</p>}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'notes' && (
          <div className="space-y-3">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes}
              placeholder="Notes sur le match..." rows={8}
              className="w-full bg-slate-800 text-white px-4 py-3 rounded-2xl border border-slate-700 focus:border-green-500 outline-none resize-none text-sm"/>
            <button onClick={saveNotes} className="w-full bg-slate-700 text-white py-3 rounded-2xl font-semibold text-sm">Sauvegarder</button>
          </div>
        )}
      </div>

      {/* Export modal */}
      {showSheet && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <div className="flex justify-between items-center px-4 py-3 bg-slate-900">
            <p className="text-white font-bold">Feuille de match</p>
            <div className="flex gap-2">
              <button onClick={handleExport} disabled={exporting}
                className="flex items-center gap-1.5 bg-green-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl">
                {exporting ? '⏳' : <><Share2 size={14}/> Partager</>}
              </button>
              <button onClick={() => setShowSheet(false)} className="text-slate-400 p-2"><X size={22}/></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto flex justify-center py-4 px-3">
            <MatchSheet ref={sheetRef} match={match} players={players} getPlayer={getPlayer}/>
          </div>
        </div>
      )}
    </div>
  );
}
