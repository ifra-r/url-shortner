// Shows newly created short URL
// lets user:
//     copy it
//     go to analytics

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ResultCard({ result }) {
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  const handleCopy = () => {
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const slug = result.shortUrl?.split('/').pop()

  return (
    <div
      className="p-4 rounded border flex flex-col gap-3"
      style={{ backgroundColor: '#111111', borderColor: '#222222' }}
    >
      <div className="flex items-center justify-between gap-3">
        <a
          href={result.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium truncate"
          style={{ color: '#e53e3e' }}
        >
          {result.shortUrl}
        </a>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleCopy}
            style={{
              backgroundColor: copied ? '#222' : '#1a1a1a',
              color: copied ? '#888' : '#f5f5f5',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={() => navigate(`/analytics/${slug}`)}
            style={{
              backgroundColor: 'transparent',
              color: '#888888',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Analytics
          </button>
        </div>
      </div>

      <p className="text-xs truncate" style={{ color: '#888888' }}>
        → {result.originalUrl}
      </p>
    </div>
  )
}