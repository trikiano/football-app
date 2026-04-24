import React, { forwardRef } from 'react';
import { POSITIONS } from '../pages/Players';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function PlayerRow({ player, goals, isMotm, rating, teamColor }) {
  if (!player) return null;
  const cfg = POSITIONS[player.position] || POSITIONS.MID;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
      <div style={{
        width:28, height:28, borderRadius:'50%',
        background: teamColor, border:'2px solid rgba(255,255,255,0.3)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'white', fontWeight:'bold', fontSize:12, flexShrink:0,
      }}>{player.name[0].toUpperCase()}</div>
      <span style={{ color:'white', fontSize:13, fontWeight:500, flex:1 }}>{player.name}</span>
      <span style={{ background: cfg.color.replace('bg-',''), fontSize:9, color:'white', fontWeight:'bold', padding:'2px 5px', borderRadius:4, flexShrink:0 }}>{cfg.short}</span>
      {goals > 0 && <span style={{ fontSize:11 }}>{'⚽'.repeat(Math.min(goals, 3))}{goals > 3 ? `×${goals}` : ''}</span>}
      {rating > 0 && (
        <span style={{ display:'flex', gap:1 }}>
          {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:10, color: s<=rating ? '#facc15' : 'rgba(255,255,255,0.2)' }}>★</span>)}
        </span>
      )}
      {isMotm && <span style={{ fontSize:14 }}>⭐</span>}
    </div>
  );
}

// CSS color map for Tailwind classes
const COLOR_MAP = {
  'bg-yellow-500': '#eab308',
  'bg-blue-500':   '#3b82f6',
  'bg-purple-500': '#a855f7',
  'bg-red-500':    '#ef4444',
};

// forwardRef so parent can pass ref for screenshot
const MatchSheet = forwardRef(function MatchSheet({ match, players, getPlayer }, ref) {
  if (!match) return null;

  const teamAPlayers = match.teamA.map(id => getPlayer(id)).filter(Boolean);
  const teamBPlayers = match.teamB.map(id => getPlayer(id)).filter(Boolean);
  const subsA = (match.subsA || []).map(id => getPlayer(id)).filter(Boolean);
  const subsB = (match.subsB || []).map(id => getPlayer(id)).filter(Boolean);
  const goals = [...(match.goals || [])].sort((a, b) => a.minute - b.minute);
  const motm = match.manOfMatch ? getPlayer(match.manOfMatch) : null;

  const getGoals = (playerId) => goals.filter(g => g.playerId === playerId).length;

  const posOrder = { GK:0, DEF:1, MID:2, ATT:3 };
  const sortByPos = (a, b) => (posOrder[a.position]??2) - (posOrder[b.position]??2);

  return (
    <div ref={ref} style={{
      background: 'linear-gradient(180deg, #0f2617 0%, #0f172a 40%, #0f172a 100%)',
      width: 380, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #15803d, #166534)', padding:'18px 20px 14px', textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:4 }}>⚽</div>
        <div style={{ color:'white', fontWeight:'900', fontSize:20, letterSpacing:1 }}>FEUILLE DE MATCH</div>
        <div style={{ color:'rgba(255,255,255,0.75)', fontSize:12, marginTop:4, textTransform:'capitalize' }}>
          {formatDate(match.date)}
        </div>
        {match.formKeyA && (
          <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:8 }}>
            <span style={{ background:'rgba(0,0,0,0.3)', color:'#86efac', fontSize:11, padding:'2px 10px', borderRadius:20, fontWeight:'bold' }}>A: {match.formKeyA}</span>
            <span style={{ background:'rgba(0,0,0,0.3)', color:'#93c5fd', fontSize:11, padding:'2px 10px', borderRadius:20, fontWeight:'bold' }}>B: {match.formKeyB}</span>
          </div>
        )}
      </div>

      {/* Score */}
      <div style={{ display:'flex', alignItems:'center', background:'rgba(255,255,255,0.05)', padding:'16px 20px' }}>
        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ color:'#86efac', fontWeight:'bold', fontSize:13, marginBottom:4 }}>ÉQUIPE A</div>
          <div style={{ color:'white', fontSize:52, fontWeight:'900', lineHeight:1 }}>{match.scoreA ?? '-'}</div>
        </div>
        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:24, fontWeight:'bold', padding:'0 8px' }}>—</div>
        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ color:'#93c5fd', fontWeight:'bold', fontSize:13, marginBottom:4 }}>ÉQUIPE B</div>
          <div style={{ color:'white', fontSize:52, fontWeight:'900', lineHeight:1 }}>{match.scoreB ?? '-'}</div>
        </div>
      </div>

      {/* MOTM */}
      {motm && (
        <div style={{ background:'rgba(250,204,21,0.1)', borderTop:'1px solid rgba(250,204,21,0.3)', borderBottom:'1px solid rgba(250,204,21,0.3)', padding:'8px 20px', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>⭐</span>
          <div>
            <div style={{ color:'#fbbf24', fontSize:10, fontWeight:'bold', letterSpacing:1 }}>HOMME DU MATCH</div>
            <div style={{ color:'white', fontSize:14, fontWeight:'bold' }}>{motm.name}</div>
          </div>
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <div style={{ padding:'12px 20px' }}>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, fontWeight:'bold', letterSpacing:1, marginBottom:8 }}>BUTS</div>
          {goals.map((g, i) => {
            const scorer = g.playerId ? getPlayer(g.playerId) : null;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11, width:28, textAlign:'right' }}>{g.minute}'</span>
                <span style={{ fontSize:14 }}>⚽</span>
                <span style={{ color:'white', fontSize:13, flex:1 }}>{scorer ? scorer.name : 'Inconnu'}</span>
                <span style={{ fontSize:11, fontWeight:'bold', color: g.team==='A'?'#86efac':'#93c5fd', background:'rgba(255,255,255,0.1)', padding:'2px 8px', borderRadius:20 }}>Éq. {g.team}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Teams */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(255,255,255,0.05)' }}>
        {/* Team A */}
        <div style={{ background:'#0f172a', padding:'12px 14px' }}>
          <div style={{ color:'#86efac', fontSize:10, fontWeight:'bold', letterSpacing:1, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e' }}/>
            ÉQUIPE A {match.formKeyA ? `· ${match.formKeyA}` : ''}
          </div>
          {[...teamAPlayers].sort(sortByPos).map(p => (
            <PlayerRow key={p.id} player={p} goals={getGoals(p.id)} isMotm={match.manOfMatch===p.id} rating={match.ratings?.[p.id]||0} teamColor="#166534" />
          ))}
          {subsA.length > 0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:9, letterSpacing:1, marginBottom:4 }}>REMPLAÇANTS</div>
              {subsA.map(p => <PlayerRow key={p.id} player={p} goals={0} isMotm={false} rating={0} teamColor="#166534" />)}
            </div>
          )}
        </div>
        {/* Team B */}
        <div style={{ background:'#0f172a', padding:'12px 14px', borderLeft:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ color:'#93c5fd', fontSize:10, fontWeight:'bold', letterSpacing:1, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#3b82f6' }}/>
            ÉQUIPE B {match.formKeyB ? `· ${match.formKeyB}` : ''}
          </div>
          {[...teamBPlayers].sort(sortByPos).map(p => (
            <PlayerRow key={p.id} player={p} goals={getGoals(p.id)} isMotm={match.manOfMatch===p.id} rating={match.ratings?.[p.id]||0} teamColor="#1d4ed8" />
          ))}
          {subsB.length > 0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:9, letterSpacing:1, marginBottom:4 }}>REMPLAÇANTS</div>
              {subsB.map(p => <PlayerRow key={p.id} player={p} goals={0} isMotm={false} rating={0} teamColor="#1d4ed8" />)}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'10px', textAlign:'center', background:'rgba(0,0,0,0.3)' }}>
        <span style={{ color:'rgba(255,255,255,0.25)', fontSize:10 }}>FootManager ⚽</span>
      </div>
    </div>
  );
});

export default MatchSheet;
