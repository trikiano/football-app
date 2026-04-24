import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Star } from 'lucide-react';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PlayerMatchView() {
  const { id } = useParams();
  const { matches, playerSession, getPlayer, setPlayerMatchRating } = useApp();
  const navigate = useNavigate();
  const match = matches.find(m => m.id === id);
  const playerId = playerSession?.playerId;
  const player = getPlayer(playerId);

  const [myRating, setMyRating] = useState(match?.playerMatchRatings?.[playerId]?.score || 0);
  const [myComment, setMyComment] = useState(match?.playerMatchRatings?.[playerId]?.comment || '');
  const [ratingSaved, setRatingSaved] = useState(false);

  if (!match || !player) return null;

  const myTeam = match.teamA.includes(playerId)||(match.subsA||[]).includes(playerId) ? 'A' : 'B';
  const isStarter = match.teamA.includes(playerId)||match.teamB.includes(playerId);
  const myGoals = match.goals.filter(g => g.playerId === playerId);
  const adminRating = match.ratings?.[playerId] || 0;
  const won = (myTeam==='A'&&match.scoreA>match.scoreB)||(myTeam==='B'&&match.scoreB>match.scoreA);
  const drew = match.scoreA === match.scoreB;
  const goals = [...match.goals].sort((a,b)=>a.minute-b.minute);

  const saveRating = () => {
    setPlayerMatchRating(id, playerId, myRating, myComment);
    setRatingSaved(true); setTimeout(() => setRatingSaved(false), 2000);
  };

  const resultColor = won ? 'text-green-400' : drew ? 'text-yellow-400' : 'text-red-400';
  const resultText = won ? 'Victoire !' : drew ? 'Match nul' : 'Défaite';

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      <div className="bg-slate-900 px-4 pt-10 pb-5">
        <button onClick={() => navigate(-1)} className="text-slate-400 mb-4"><ArrowLeft size={24}/></button>
        <p className="text-slate-400 text-xs capitalize mb-1">{formatDate(match.date)}</p>

        {/* Score */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex-1 text-center">
            <p className={`font-bold ${myTeam==='A'?'text-green-400':'text-slate-400'}`}>Équipe A {myTeam==='A'?'(moi)':''}</p>
            {match.status!=='scheduled' && <p className={`text-5xl font-black mt-1 ${match.scoreA>match.scoreB?'text-white':'text-slate-500'}`}>{match.scoreA}</p>}
          </div>
          <div className="text-center px-4">
            {match.status!=='scheduled' && <p className="text-slate-600 text-2xl font-bold">–</p>}
            {match.status==='scheduled' && <p className="text-slate-500 text-2xl font-bold">VS</p>}
          </div>
          <div className="flex-1 text-center">
            <p className={`font-bold ${myTeam==='B'?'text-blue-400':'text-slate-400'}`}>Équipe B {myTeam==='B'?'(moi)':''}</p>
            {match.status!=='scheduled' && <p className={`text-5xl font-black mt-1 ${match.scoreB>match.scoreA?'text-white':'text-slate-500'}`}>{match.scoreB}</p>}
          </div>
        </div>

        {match.status==='finished' && (
          <div className="text-center mt-3">
            <p className={`text-lg font-black ${resultColor}`}>{resultText}</p>
            {!isStarter && <p className="text-slate-500 text-xs mt-1">🔄 Remplaçant</p>}
          </div>
        )}
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* My performance */}
        {match.status === 'finished' && (
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Ma performance</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-white">{myGoals.length}</p>
                <p className="text-slate-400 text-xs">But{myGoals.length!==1?'s':''}</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                {adminRating > 0 ? (
                  <>
                    <p className="text-yellow-400 text-lg">{'★'.repeat(adminRating)}{'☆'.repeat(5-adminRating)}</p>
                    <p className="text-slate-400 text-xs">Note admin</p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-500 text-2xl">–</p>
                    <p className="text-slate-500 text-xs">Pas encore noté</p>
                  </>
                )}
              </div>
            </div>
            {match.manOfMatch === playerId && (
              <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2 text-center">
                <p className="text-yellow-400 font-bold">⭐ Homme du match !</p>
              </div>
            )}
          </div>
        )}

        {/* Goals timeline */}
        {goals.length > 0 && (
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Buts du match</p>
            <div className="space-y-2">
              {goals.map(g => {
                const scorer = g.playerId ? getPlayer(g.playerId) : null;
                const isMe = g.playerId === playerId;
                return (
                  <div key={g.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 border-l-4 ${isMe?'bg-green-900/30 border-green-400':'bg-slate-800 border-slate-600'} ${g.team==='A'?'':'opacity-80'}`}>
                    <span className="text-slate-400 text-sm w-8">{g.minute}'</span>
                    <span className={`flex-1 ${isMe?'text-green-300 font-bold':'text-white'}`}>⚽ {scorer?scorer.name:'Inconnu'}{isMe?' (moi)':''}</span>
                    <span className={`text-xs font-bold ${g.team==='A'?'text-green-400':'text-blue-400'}`}>Éq.{g.team}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Player self-rating */}
        {match.status === 'finished' && (
          <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Mon avis sur ce match</p>
            <div className="flex gap-1 justify-center mb-3">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setMyRating(s)} className="p-1">
                  <Star size={32} className={s<=myRating?'text-yellow-400 fill-yellow-400':'text-slate-600'}/>
                </button>
              ))}
            </div>
            <textarea value={myComment} onChange={e => setMyComment(e.target.value)}
              placeholder="Commentaire (optionnel)..."
              rows={3}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-green-500 outline-none resize-none text-sm mb-3"/>
            <button onClick={saveRating} disabled={myRating===0}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-colors disabled:opacity-40 ${ratingSaved?'bg-green-500 text-white':'bg-green-600 text-white'}`}>
              {ratingSaved?'✓ Avis enregistré !':'Envoyer mon avis'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
