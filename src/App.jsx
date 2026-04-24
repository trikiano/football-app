import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Matches from './pages/Matches';
import CreateMatch from './pages/CreateMatch';
import LiveScore from './pages/LiveScore';
import MatchDetail from './pages/MatchDetail';
import Stats from './pages/Stats';
import Navbar from './components/Navbar';
import PlayerDashboard from './pages/PlayerDashboard';
import PlayerProfile from './pages/PlayerProfile';
import PlayerMatchView from './pages/PlayerMatchView';
import PlayerMatches from './pages/PlayerMatches';

function AdminRoute({ children }) {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PlayerRoute({ children }) {
  const { playerSession } = useApp();
  return playerSession ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated, playerSession } = useApp();
  const anyAuth = isAuthenticated || !!playerSession;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> :
          playerSession ? <Navigate to="/player" replace /> :
          <Login />
        } />

        {/* Admin routes */}
        <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/players" element={<AdminRoute><Players /></AdminRoute>} />
        <Route path="/matches" element={<AdminRoute><Matches /></AdminRoute>} />
        <Route path="/matches/new" element={<AdminRoute><CreateMatch /></AdminRoute>} />
        <Route path="/matches/:id/live" element={<AdminRoute><LiveScore /></AdminRoute>} />
        <Route path="/matches/:id" element={<AdminRoute><MatchDetail /></AdminRoute>} />
        <Route path="/stats" element={<AdminRoute><Stats /></AdminRoute>} />

        {/* Player routes */}
        <Route path="/player" element={<PlayerRoute><PlayerDashboard /></PlayerRoute>} />
        <Route path="/player/profile" element={<PlayerRoute><PlayerProfile /></PlayerRoute>} />
        <Route path="/player/matches" element={<PlayerRoute><PlayerMatches /></PlayerRoute>} />
        <Route path="/player/match/:id" element={<PlayerRoute><PlayerMatchView /></PlayerRoute>} />

        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : playerSession ? '/player' : '/login'} replace />} />
      </Routes>
      {anyAuth && <Navbar />}
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
