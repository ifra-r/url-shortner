// Displays list of previously created URLs with quick access to analytics

import { useNavigate } from 'react-router-dom'

export default function UrlList({ urls }) {
  const navigate = useNavigate()

  if (urls.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium" style={{ color: '#888888' }}>
        Created URLs
      </h2>

      <div
        className="rounded border overflow-hidden"
        style={{ borderColor: '#222222' }}
      >
        {/* table header */}
        <div
          className="grid text-xs font-medium px-4 py-2"
          style={{
            gridTemplateColumns: '2fr 1fr 1fr auto',
            backgroundColor: '#0f0f0f',
            color: '#888888',
            borderBottom: '1px solid #222222'
          }}
        >
          <span>Original URL</span>
          <span>Short URL</span>
          <span>Created</span>
          <span></span>
        </div>

        {/* rows */}
        {urls.map((url, i) => (
          <div
            key={i}
            className="grid items-center px-4 py-3 text-sm"
            style={{
              gridTemplateColumns: '2fr 1fr 1fr auto',
              borderBottom: i < urls.length - 1 ? '1px solid #1a1a1a' : 'none',
              color: '#f5f5f5',
            }}
          >
            <span className="truncate pr-4" style={{ color: '#888888' }}>
              {url.originalUrl}
            </span>

            <a
              href={url.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate"
              style={{ color: '#e53e3e' }}
            >
              {url.shortUrl.split('/').pop()}
            </a>

            <span style={{ color: '#888888' }}>
              {new Date(url.createdAt).toLocaleDateString()}
            </span>

            <button
              onClick={() => navigate(`/analytics/${url.shortUrl.split('/').pop()}`)}
              style={{
                backgroundColor: 'transparent',
                color: '#888',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Stats
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}