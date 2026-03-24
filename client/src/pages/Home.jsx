import { useState, useEffect } from 'react'
import UrlForm from '../components/UrlForm'
import ResultCard from '../components/ResultCard'
import UrlList from '../components/UrlList'

// Key used to store URLs in browser localStorage
const STORAGE_KEY = 'slash_urls'

export default function Home() {
  // Stores most recently shortened URL
  const [latestResult, setLatestResult] = useState(null)
  // Stores list/history of all shortened URLs
  const [urls, setUrls] = useState([])

  // load saved URLs from localStorage on page load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setUrls(JSON.parse(saved))
  }, [])

  // url shortnening success 
  const handleSuccess = (data) => {
    setLatestResult(data)
    const updated = [data, ...urls] // add new res on top of list)
    setUrls(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))  // persist updated list in local storage
  }


  return (
    <div className="flex flex-col gap-8">
      {/* hero */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: '#f5f5f5' }}>
          Shorten any URL
        </h1>
        <p className="text-sm" style={{ color: '#888888' }}>
          Shrink it and share it.
        </p>
      </div>

      {/* form */}
      <div
        className="p-5 rounded border"
        style={{ backgroundColor: '#111111', borderColor: '#222222' }}
      >
        <UrlForm onSuccess={handleSuccess} />
      </div>

      {/* latest result */}
      {latestResult && <ResultCard result={latestResult} />}

      {/* url list */}
      <UrlList urls={urls} />
    </div>
  )
}