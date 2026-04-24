import React from 'react';
import { Plus, X } from 'lucide-react';
import { POSITIONS } from '../pages/Players';

function PlayerSlot({ player, posKey, onAdd, onRemove, teamColor }) {
  const cfg = POSITIONS[posKey] || POSITIONS.MID;
  if (player) {
    const pcfg = POSITIONS[player.position] || cfg;
    return (
      <div className="flex flex-col items-center gap-0.5 relative" style={{ width: 48 }}>
        <button onClick={onRemove} className="absolute -top-1 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center z-10 shadow">
          <X size={9} className="text-white" />
        </button>
        <div className={`w-9 h-9 rounded-full ${teamColor} border-2 border-white/40 flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
          {player.name[0].toUpperCase()}
        </div>
        <span className="text-white text-[9px] font-semibold text-center leading-tight max-w-[46px] truncate drop-shadow">
          {player.name.split(' ')[0]}
        </span>
        <span className={`${pcfg.color} text-white text-[8px] font-bold px-1 rounded-sm leading-tight`}>{pcfg.short}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-0.5" style={{ width: 48 }}>
      <button onClick={onAdd} className="w-9 h-9 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5 active:bg-white/20 transition-colors">
        <Plus size={16} className="text-white/40" />
      </button>
      <span className="text-white/30 text-[9px] font-semibold">{cfg.short}</span>
    </div>
  );
}

function makeRows(fDef) {
  return [
    { pos: 'GK',  count: 1 },
    { pos: 'DEF', count: fDef.DEF },
    ...(fDef.MID > 0 ? [{ pos: 'MID', count: fDef.MID }] : []),
    { pos: 'ATT', count: fDef.ATT },
  ];
}

function TeamHalf({ rows, formation, getPlayer, onSlotClick, onSlotRemove, teamColor, reversed }) {
  const displayRows = reversed ? [...rows].reverse() : rows;
  return (
    <div className="flex-1 flex flex-col justify-around py-1">
      {displayRows.map(({ pos, count }) => {
        const slots = formation[pos] || Array(count).fill(null);
        return (
          <div key={pos} className="flex justify-evenly items-center w-full px-2">
            {slots.map((playerId, i) => (
              <PlayerSlot key={i}
                player={playerId ? getPlayer(playerId) : null}
                posKey={pos} teamColor={teamColor}
                onAdd={() => onSlotClick(pos, i)}
                onRemove={() => onSlotRemove(pos, i)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// formationDefA and formationDefB can differ per team
export default function FootballPitch({ formationA, formationB, getPlayer, onSlotClick, onSlotRemove, formationDefA, formationDefB }) {
  const rowsA = makeRows(formationDefA);
  const rowsB = makeRows(formationDefB);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden select-none" style={{ aspectRatio: '9/16', maxHeight: '68vh' }}>
      {/* Pitch stripes */}
      <div className="absolute inset-0" style={{
        background: 'repeating-linear-gradient(180deg, #16a34a 0px, #16a34a 40px, #15803d 40px, #15803d 80px)'
      }} />
      {/* SVG lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 178" preserveAspectRatio="none">
        <rect x="3" y="2" width="94" height="174" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"/>
        <line x1="3" y1="89" x2="97" y2="89" stroke="rgba(255,255,255,0.55)" strokeWidth="1"/>
        <circle cx="50" cy="89" r="11" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.9"/>
        <circle cx="50" cy="89" r="1.2" fill="rgba(255,255,255,0.7)"/>
        <rect x="26" y="2" width="48" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
        <rect x="37" y="2" width="26" height="9" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
        <circle cx="50" cy="14" r="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7"/>
        <rect x="26" y="156" width="48" height="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
        <rect x="37" y="169" width="26" height="9" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
        <circle cx="50" cy="164" r="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7"/>
        <rect x="40" y="0" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
        <rect x="40" y="175" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
      </svg>

      <div className="absolute top-1.5 left-0 right-0 flex justify-center z-10">
        <span className="bg-green-700/90 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow">⚽ Équipe A</span>
      </div>
      <div className="absolute bottom-1.5 left-0 right-0 flex justify-center z-10">
        <span className="bg-blue-700/90 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow">⚽ Équipe B</span>
      </div>

      <div className="absolute inset-0 flex flex-col z-10 pt-6 pb-6">
        <TeamHalf rows={rowsA} formation={formationA} getPlayer={getPlayer}
          onSlotClick={(pos, i) => onSlotClick('A', pos, i)}
          onSlotRemove={(pos, i) => onSlotRemove('A', pos, i)}
          teamColor="bg-green-800" reversed={false} />
        <div className="h-6 flex-shrink-0" />
        <TeamHalf rows={rowsB} formation={formationB} getPlayer={getPlayer}
          onSlotClick={(pos, i) => onSlotClick('B', pos, i)}
          onSlotRemove={(pos, i) => onSlotRemove('B', pos, i)}
          teamColor="bg-blue-800" reversed={true} />
      </div>
    </div>
  );
}
