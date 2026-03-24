import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav
      className="border-b px-6 py-4 flex items-center justify-between"
      style={{ borderColor: '#222222', backgroundColor: '#111111' }}
    >
      <Link to="/" className="text-lg font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
        slash<span style={{ color: '#e53e3e' }}>.</span>
      </Link>
      <span className="text-sm" style={{ color: '#888888' }}>
        URL Shortener
      </span>
    </nav>
  )
}