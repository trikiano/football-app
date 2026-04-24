import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Camera } from 'lucide-react';
import { POSITIONS } from './Players';

export default function PlayerProfile() {
  const { playerSession, getPlayer, updatePlayer, logoutPlayer } = useApp();
  const navigate = useNavigate();
  const player = getPlayer(playerSession?.playerId);
  const fileRef = useRef(null);

  const [name, setName] = useState(player?.name || '');
  const [position, setPosition] = useState(player?.position || 'MID');
  const [birthday, setBirthday] = useState(player?.birthday || '');
  const [photo, setPhoto] = useState(player?.photo || '');
  const [saved, setSaved] = useState(false);

  if (!player) return null;

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updatePlayer(player.id, { name: name.trim() || player.name, position, birthday, photo });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cfg = POSITIONS[position] || POSITIONS.MID;

  return (
    <div className="pb-24 min-h-screen bg-slate-950">
      <div className="bg-slate-900 px-4 pt-10 pb-5">
        <button onClick={() => navigate('/player')} className="text-slate-400 mb-4"><ArrowLeft size={24}/></button>
        <h1 className="text-2xl font-bold text-white">Mon profil</h1>
        <p className="text-slate-400 text-sm mt-1">Modifier mes informations</p>
      </div>

      <div className="px-4 mt-5 space-y-5">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {photo ? (
              <img src={photo} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-green-500"/>
            ) : (
              <div className={`w-24 h-24 rounded-full ${cfg.color} flex items-center justify-center text-white font-black text-4xl border-2 border-white/20`}>
                {(name||player.name)[0]?.toUpperCase()}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-9 h-9 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Camera size={16} className="text-white"/>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
          <p className="text-slate-400 text-xs">Appuyez sur 📷 pour changer la photo</p>
        </div>

        {/* Name */}
        <div>
          <label className="text-slate-400 text-sm font-semibold block mb-2">Prénom / Surnom</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-slate-800 text-white px-4 py-3 rounded-2xl border border-slate-700 focus:border-green-500 outline-none text-base"/>
        </div>

        {/* Birthday */}
        <div>
          <label className="text-slate-400 text-sm font-semibold block mb-2">Date de naissance</label>
          <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
            className="w-full bg-slate-800 text-white px-4 py-3 rounded-2xl border border-slate-700 focus:border-green-500 outline-none text-base"/>
        </div>

        {/* Position */}
        <div>
          <label className="text-slate-400 text-sm font-semibold block mb-2">Poste préféré</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(POSITIONS).map(([key, c]) => (
              <button key={key} onClick={() => setPosition(key)}
                className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${position===key?`${c.color} text-white`:'bg-slate-800 text-slate-400'}`}>
                <span className="text-xl">{c.icon}</span>
                <span className="text-xs font-bold">{c.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-colors ${saved?'bg-green-500 text-white':'bg-green-600 text-white'}`}>
          {saved ? '✓ Sauvegardé !' : 'Enregistrer'}
        </button>

        {/* Logout */}
        <button onClick={() => { logoutPlayer(); navigate('/'); }}
          className="w-full py-4 rounded-2xl font-semibold text-base bg-slate-800 text-red-400">
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
