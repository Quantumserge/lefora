import type { NextApiRequest, NextApiResponse } from 'next'

const WMO: Record<number, string> = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog', 51: 'Light drizzle', 53: 'Drizzle',
  55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Rain showers',
  81: 'Showers', 82: 'Heavy showers', 95: 'Thunderstorm',
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  const query = String(req.query.location || '').trim()
  const mode = String(req.query.mode || '')
  if (!query) return res.status(400).json({ error: 'Enter a city or area.' })
  try {
    const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
    geoUrl.search = new URLSearchParams({ name: query, count: mode === 'search' ? '8' : '1', language: 'en', format: 'json' }).toString()
    let place: any
    if (req.query.latitude != null && req.query.longitude != null) {
      const latitude = Number(req.query.latitude)
      const longitude = Number(req.query.longitude)
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
          || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: 'Selected location coordinates are invalid.' })
      }
      place = {
        name: String(req.query.label || 'Selected location').trim().slice(0, 180),
        latitude, longitude,
      }
    } else {
      const geoResponse = await fetch(geoUrl)
      if (!geoResponse.ok) throw new Error('Location lookup failed.')
      const geo = await geoResponse.json()
      if (mode === 'search') {
        const results = (geo.results || []).map((result: any) => ({
          name: result.name,
          admin1: result.admin1 || '',
          country: result.country || '',
          latitude: result.latitude,
          longitude: result.longitude,
          timezone: result.timezone || null,
          label: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
        }))
        return res.status(200).json({ results })
      }
      place = geo.results?.[0]
      if (!place) return res.status(404).json({ error: 'Location not found. Try city and country.' })
    }
    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast')
    forecastUrl.search = new URLSearchParams({
      latitude: String(place.latitude), longitude: String(place.longitude),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      forecast_days: '7', timezone: 'auto',
    }).toString()
    const forecastResponse = await fetch(forecastUrl)
    if (!forecastResponse.ok) throw new Error('Forecast lookup failed.')
    const forecast = await forecastResponse.json()
    const days = (forecast.daily?.time || []).map((date: string, i: number) => {
      const high = forecast.daily.temperature_2m_max?.[i] ?? null
      const low = forecast.daily.temperature_2m_min?.[i] ?? null
      const rain = forecast.daily.precipitation_sum?.[i] ?? null
      const chance = forecast.daily.precipitation_probability_max?.[i] ?? null
      const wind = forecast.daily.wind_speed_10m_max?.[i] ?? null
      const risks = []
      if (high !== null && high >= 35) risks.push('Heat stress conditions')
      if (low !== null && low <= 3) risks.push('Near-freezing conditions')
      if (rain !== null && rain >= 20 && chance !== null && chance >= 60) risks.push('Heavy rain may waterlog containers')
      if (wind !== null && wind >= 35) risks.push('Strong wind may damage young plants')
      return {
        date, condition: WMO[forecast.daily.weather_code?.[i]] || 'Variable conditions',
        high_c: high, low_c: low, rain_mm: rain, rain_probability_percent: chance,
        wind_kmh: wind, advisories: risks,
      }
    })
    return res.status(200).json({
      location: [place.name, place.admin1, place.country].filter(Boolean).join(', '),
      timezone: forecast.timezone, days,
      source: 'Open-Meteo forecast and geocoding APIs',
      note: 'General weather-based care advisories only; not a species-specific disease diagnosis.',
    })
  } catch (error: any) {
    return res.status(502).json({ error: error.message || 'Weather forecast is unavailable.' })
  }
}
