'use client'

import { FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import { WeatherDay, WeatherPlace } from './types'

export function WeatherCard() {
  const [location, setLocation] = useState('')
  const [weather, setWeather] = useState<{ location: string; days: WeatherDay[]; note: string } | null>(null)
  const [places, setPlaces] = useState<WeatherPlace[]>([])
  const [selectedPlace, setSelectedPlace] = useState<WeatherPlace | null>(null)
  const [appleMaps, setAppleMaps] = useState(false)
  const [searchBusy, setSearchBusy] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setLocation(window.localStorage.getItem('plant-weather-location') || '')
    const savedPlace = window.localStorage.getItem('plant-weather-place')
    if (savedPlace) {
      try { setSelectedPlace(JSON.parse(savedPlace) as WeatherPlace) } catch { window.localStorage.removeItem('plant-weather-place') }
    }
    setAppleMaps(/iPad|iPhone|iPod/.test(navigator.userAgent))
  }, [])

  const searchPlaces = async (event: FormEvent) => {
    event.preventDefault(); setSearchBusy(true); setError(''); setPlaces([])
    try {
      const result = await axios.get('/api/weather', { params: { mode: 'search', location } })
      const results = result.data.results || []
      setPlaces(results)
      if (results.length === 0) setError('No matching places found. Try adding a city or region.')
    } catch (e: any) { setError(e?.response?.data?.error || 'Location search is unavailable right now.') }
    finally { setSearchBusy(false) }
  }

  const choosePlace = async (place: WeatherPlace) => {
    setSelectedPlace(place); setLocation(place.label); setPlaces([])
    setBusy(true); setError(''); setWeather(null)
    window.localStorage.setItem('plant-weather-location', place.label)
    window.localStorage.setItem('plant-weather-place', JSON.stringify(place))
    try {
      const result = await axios.get('/api/weather', { params: { location: place.label, latitude: place.latitude, longitude: place.longitude, label: place.label } })
      setWeather(result.data)
    } catch (e: any) { setError(e?.response?.data?.error || 'Forecast is unavailable right now.') }
    finally { setBusy(false) }
  }

  const mapsUrl = (place: WeatherPlace) => {
    const coordinates = `${place.latitude},${place.longitude}`
    return appleMaps
      ? `https://maps.apple.com/?ll=${encodeURIComponent(coordinates)}&q=${encodeURIComponent(place.label)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.label} ${coordinates}`)}`
  }

  return (
    <section className="nx-section" aria-labelledby="weather-title">
      <div className="nx-card" id="weather">
        <div className="nx-weather-head">
          <div className="nx-tool-head">
            <span className="nx-tool-num">03</span>
            <div>
              <p className="nx-eyebrow">Grow with the forecast</p>
              <h2 id="weather-title" className="nx-card-title">Local weather</h2>
            </div>
          </div>
          <span className="nx-sun" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          </span>
        </div>
        <p className="nx-help">Check upcoming conditions and care alerts for your nursery area.</p>

        <form onSubmit={searchPlaces} className="nx-weather-search">
          <input className="nx-input" aria-label="Weather location" value={location} placeholder="Search city or nursery area" onChange={e => {
            const value = e.target.value
            setLocation(value)
            if (value !== selectedPlace?.label) {
              setSelectedPlace(null); setWeather(null); setPlaces([])
              window.localStorage.removeItem('plant-weather-place')
              window.localStorage.removeItem('plant-weather-location')
            }
          }} />
          <button className="nx-btn" disabled={searchBusy || !location.trim()}>{searchBusy ? 'Searching…' : 'Find places'}</button>
        </form>

        {places.length > 0 && <div className="nx-places" role="list" aria-label="Matching places">
          <p className="nx-places-caption">Choose the right place for your nursery:</p>
          {places.map(place => <div className="nx-place" role="listitem" key={`${place.latitude}-${place.longitude}`}>
            <button type="button" className="nx-place-select" onClick={() => void choosePlace(place)} disabled={busy}>
              <span><strong>{place.name}</strong><small>{[place.admin1, place.country].filter(Boolean).join(', ')}</small></span>
              <span aria-hidden="true">→</span>
            </button>
            <a className="nx-link" href={mapsUrl(place)} target="_blank" rel="noopener noreferrer">Map ↗</a>
          </div>)}
        </div>}

        {selectedPlace && <div className="nx-selected">
          <div><span>Selected nursery area</span><strong>{selectedPlace.label}</strong></div>
          <div className="nx-selected-actions">
            {!weather && <button type="button" className="nx-link" onClick={() => void choosePlace(selectedPlace)} disabled={busy}>Get forecast</button>}
            <a className="nx-link" href={mapsUrl(selectedPlace)} target="_blank" rel="noopener noreferrer">Open in {appleMaps ? 'Apple Maps' : 'Google Maps'} <span aria-hidden="true">↗</span></a>
          </div>
        </div>}

        {busy && <p className="nx-loading" role="status">Finding the local forecast…</p>}
        {error && <div className="nx-alert nx-alert-error">{error}</div>}

        {weather && <>
          <div className="nx-weather-loc">{weather.location}</div>
          <div className="nx-forecast">{weather.days.map(day => <article className="nx-day" key={day.date}>
            <strong>{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
            <span className="nx-day-temp">{day.high_c ?? '—'}° <small>/ {day.low_c ?? '—'}°</small></span>
            <span>{day.condition}</span>
            <small>Rain {day.rain_mm ?? '—'} mm · Wind {day.wind_kmh ?? '—'} km/h</small>
            {day.advisories.length > 0 && <ul>{day.advisories.map((a, i) => <li key={i}>{a}</li>)}</ul>}
          </article>)}</div>
          <p className="nx-privacy">{weather.note} Source: Open-Meteo forecast and geocoding.</p>
        </>}
      </div>
    </section>
  )
}
