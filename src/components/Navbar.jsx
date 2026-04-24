import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, BarChart2, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const adminLinks = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/players', icon: Users, label: 'Joueurs' },
  { to: '/matches', icon: Calendar, label: 'Matchs' },
  { to: '/stats', icon: BarChart2, label: 'Stats' },
];

const playerLinks = [
  { to: '/player', icon: Home, label: 'Accueil' },
  { to: '/player/matches', icon: Calendar, label: 'Mes matchs' },
  { to: '/player/profile', icon: User, label: 'Mon profil' },
];

export default function Navbar() {
  const { isAuthenticated, playerSession } = useApp();
  const links = isAuthenticated ? adminLinks : playerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 safe-bottom z-50">
      <div className="flex">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/' || to === '/player'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${isActive ? 'text-green-400' : 'text-slate-400'}`
            }>
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
