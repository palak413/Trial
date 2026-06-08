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
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <Routes>
          <Route path="/"       element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/jobs"   element={<JobPage />} />
          <Route path="/match"  element={<MatchPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}