import { NavLink, Route, Routes } from 'react-router-dom'
import Activities from './components/Activities.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Teams from './components/Teams.jsx'
import Users from './components/Users.jsx'
import Workouts from './components/Workouts.jsx'
import './App.css'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/users', label: 'Users' },
  { to: '/teams', label: 'Teams' },
  { to: '/activities', label: 'Activities' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/workouts', label: 'Workouts' },
]

function Home() {
  const codespaceName = import.meta.env.VITE_CODESPACE_NAME;
  const apiBaseUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : 'http://localhost:8000';

  return (
    <div className="route-panel home-panel">
      <div className="mb-4">
        <h1>OctoFit Tracker</h1>
        <p className="lead">Multi-tier fitness dashboard</p>
      </div>

      <div className="alert alert-info" role="alert">
        VITE_CODESPACE_NAME must be defined in .env.local for Codespaces. When it is not set, the app falls back to {apiBaseUrl}.
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h2 className="h4 mb-3">API status</h2>
          <p className="mb-1"><strong>Base URL:</strong> {apiBaseUrl}</p>
          <p className="mb-0"><strong>Mode:</strong> {codespaceName ? 'Codespaces' : 'Localhost'}</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">OctoFit</span>
          <div className="navbar-nav d-flex flex-row flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/workouts" element={<Workouts />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
