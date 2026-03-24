import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Analytics from './pages/Analytics'

// Root layout + routing: renders navbar and switches pages based on URL

export default function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics/:slug" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  )
}