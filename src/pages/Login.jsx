import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Eye, EyeOff, Phone } from 'lucide-react';

export default function Login() {
  const { login, loginAsPlayer } = useApp();
  const [tab, setTab] = useState('player');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinPhone = params.get('join');
    if (joinPhone) { setPhone(joinPhone); setTab('player'); }
  }, []);

  const handleAdmin = (e) => {
    e.preventDefault();
    if (!login(password)) { setError('Mot de passe incorrect'); setPassword(''); }
  };

  const handlePlayer = (e) => {
    e.preventDefault();
    if (!loginAsPlayer(phone, pin)) { setError('Numéro ou PIN incorrect'); setPin(''); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mb-4 text-4xl shadow-xl">⚽</div>
          <h1 className="text-3xl font-bold text-white">FootManager</h1>
        </div>
        <div className="flex bg-slate-800 rounded-2xl p-1 mb-6">
          <button onClick={() => { setTab('player'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab==='player'?'bg-green-600 text-white':'text-slate-400'}`}>
            👤 Joueur
          </button>
          <button onClick={() => { setTab('admin'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab==='admin'?'bg-slate-600 text-white':'text-slate-400'}`}>
            🔑 Admin
          </button>
        </div>
        {tab === 'player' && (
          <form onSubmit={handlePlayer} className="space-y-3">
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }}
                placeholder="Numéro de téléphone"
                className="w-full bg-slate-800 text-white pl-11 pr-4 py-4 rounded-2xl text-base outline-none border border-slate-700 focus:border-green-500 transition-colors" />
            </div>
            <input type="tel" inputMode="numeric" maxLength={6}
              value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g,'')); setError(''); }}
              placeholder="PIN"
              className="w-full bg-slate-800 text-white px-4 py-4 rounded-2xl text-base outline-none border border-slate-700 focus:border-green-500 transition-colors text-center text-2xl tracking-[0.5em] font-bold" />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" disabled={!phone||pin.length<4}
              className="w-full bg-green-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-base">Connexion</button>
            <p className="text-center text-slate-500 text-xs">Demandez votre PIN à l'administrateur</p>
          </form>
        )}
        {tab === 'admin' && (
          <form onSubmit={handleAdmin} className="space-y-4">
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPw?'text':'password'} value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Mot de passe admin" autoFocus
                className="w-full bg-slate-800 text-white pl-11 pr-12 py-4 rounded-2xl text-base outline-none border border-slate-700 focus:border-green-500 transition-colors" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw?<EyeOff size={18}/>:<Eye size={18}/>}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-slate-600 text-white font-bold py-4 rounded-2xl text-base">Connexion Admin</button>
            <p className="text-center text-slate-500 text-sm mt-2">Défaut : <span className="text-slate-400">admin123</span></p>
          </form>
        )}
      </div>
    </div>
  );
}
