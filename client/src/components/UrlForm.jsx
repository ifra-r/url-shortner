// takes user input
// calls API
// sends result back to parent (Home)

// handleSubmit → createShortUrl → onSuccess(data)

import { useState } from 'react'
import ErrorMessage from './ErrorMessage'
import { createShortUrl } from '../api/urls'

export default function UrlForm({ onSuccess }) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!originalUrl) return setError('Please enter a URL.')

    setLoading(true)
    try {
      const data = await createShortUrl(
        originalUrl,
        alias || null,
        expiresAt || null
      )
      onSuccess(data)
      setOriginalUrl('')
      setAlias('')
      setExpiresAt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    backgroundColor: '#111111',
    border: '1px solid #222222',
    color: '#f5f5f5',
    borderRadius: '6px',
    padding: '10px 14px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="url"
        placeholder="Paste your long URL here..."
        value={originalUrl}
        onChange={(e) => setOriginalUrl(e.target.value)}
        style={inputStyle}
      />
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Custom alias (optional)"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          style={{ ...inputStyle, width: '50%' }}
        />
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          style={{ ...inputStyle, width: '50%', colorScheme: 'dark' }}
        />
      </div>
      <ErrorMessage message={error} />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#c53030' : '#e53e3e',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 20px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: '500',
          fontSize: '14px',
          transition: 'background 0.2s',
        }}
      >
        {loading ? 'Shortening...' : 'Shorten URL'}
      </button>
    </div>
  )
}