import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/UploadPage'
import JobPage from './pages/JobPage'
import MatchPage from './pages/MatchPage'
import LeaderboardPage from './pages/LeaderboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f7f6f3' }}>
        <Navbar />
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/upload"      element={<UploadPage />} />
          <Route path="/jobs"        element={<JobPage />} />
          <Route path="/match"       element={<MatchPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}