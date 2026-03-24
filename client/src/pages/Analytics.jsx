// Fetches and displays analytics for a specific short URL
// gets slug from URL
// calls backend
// shows stats / lists 

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAnalytics } from '../api/urls'
import ErrorMessage from '../components/ErrorMessage'

export default function Analytics() {
  const { slug } = useParams()  //  get slug from url
  const navigate = useNavigate()

  // State for API response, error, and loading status
  const [data, setData] = useState(null)  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch analytics when component loads or slug changes
  useEffect(() => {
    getAnalytics(slug)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  // Reusable UI block for stats
  const statBox = (label, value) => (
    <div
      className="p-4 rounded border flex flex-col gap-1"
      style={{ backgroundColor: '#111111', borderColor: '#222222' }}
    >
      <span className="text-xs" style={{ color: '#888888' }}>{label}</span>
      <span className="text-2xl font-semibold" style={{ color: '#f5f5f5' }}>{value}</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold" style={{ color: '#f5f5f5' }}>
          Analytics — <span style={{ color: '#e53e3e' }}>{slug}</span>
        </h1>
      </div>

      {loading && <p style={{ color: '#888' }}>Loading...</p>}
      <ErrorMessage message={error} />

      {data && (
        <div className="flex flex-col gap-6">
          {/* stat boxes */}
          <div className="grid grid-cols-2 gap-3">
            {statBox('Total Clicks', data.totalClicks)}
            {statBox('Days Tracked', data.clicksPerDay.length)}
          </div>

          {/* clicks per day */}
          {data.clicksPerDay.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium" style={{ color: '#888888' }}>Clicks per Day</h2>
              <div className="rounded border overflow-hidden" style={{ borderColor: '#222222' }}>
                {data.clicksPerDay.map((row, i) => (
                  <div
                    key={i}
                    className="flex justify-between px-4 py-2 text-sm"
                    style={{
                      borderBottom: i < data.clicksPerDay.length - 1 ? '1px solid #1a1a1a' : 'none',
                    }}
                  >
                    <span style={{ color: '#888' }}>{new Date(row.date).toLocaleDateString()}</span>
                    <span style={{ color: '#f5f5f5' }}>{Number(row.count)} clicks</span>
                    {/* <span style={{ color: '#f5f5f5' }}>{row.count} clicks</span> */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* top IPs */}
          {data.topIPs.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium" style={{ color: '#888888' }}>Top IPs</h2>
              <div className="rounded border overflow-hidden" style={{ borderColor: '#222222' }}>
                {data.topIPs.map((row, i) => (
                  <div
                    key={i}
                    className="flex justify-between px-4 py-2 text-sm"
                    style={{
                      borderBottom: i < data.topIPs.length - 1 ? '1px solid #1a1a1a' : 'none',
                    }}
                  >
                    <span style={{ color: '#888' }}>{row.ip}</span>
                    <span style={{ color: '#f5f5f5' }}>{row.count} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* recent clicks */}
          {data.recentClicks?.data?.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium" style={{ color: '#888888' }}>Recent Clicks</h2>
              <div className="rounded border overflow-hidden" style={{ borderColor: '#222222' }}>
                {data.recentClicks.data.map((click, i) => (
                  <div
                    key={i}
                    className="flex flex-col px-4 py-3 text-xs gap-1"
                    style={{
                      borderBottom: i < data.recentClicks.data.length - 1 ? '1px solid #1a1a1a' : 'none',
                    }}
                  >
                    <span style={{ color: '#f5f5f5' }}>{click.ip}</span>
                    <span style={{ color: '#888' }}>{click.user_agent}</span>
                    <span style={{ color: '#555' }}>{new Date(click.clicked_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: '#555' }}>
                Page {data.recentClicks.page} of {data.recentClicks.totalPages}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}