'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Feedback, Plant, ReferencePlant, Species } from './types'
import { NurseryHero, NurseryNav, NurseryShortcuts } from './nursery-hero'
import { PlantCollection, SpeciesGroup, SpeciesLibrary } from './plant-collection'
import { ReferenceCohort } from './reference-cohort'
import { AddPlantCard } from './add-plant-card'
import { MeasureCard } from './measure-card'
import { WeatherCard } from './weather-card'
import { useScrollReveal } from './use-scroll-reveal'

export default function Nursery() {
  const rootRef = useRef<HTMLDivElement>(null)
  useScrollReveal(rootRef)
  const [plants, setPlants] = useState<Plant[]>([])
  const [referencePlants, setReferencePlants] = useState<ReferencePlant[]>([])
  const [species, setSpecies] = useState<Species[]>([])
  const [calibration, setCalibration] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    setLoadError('')
    try {
      const [inventory, catalog, calibrationState] = await Promise.all([
        axios.get('/api/nursery'), axios.get('/api/species'), axios.get('/api/calibration'),
      ])
      setPlants(Array.isArray(inventory.data?.plants) ? inventory.data.plants : [])
      setReferencePlants(Array.isArray(inventory.data?.reference_cohort) ? inventory.data.reference_cohort : [])
      setSpecies(Array.isArray(catalog.data) ? catalog.data : [])
      setCalibration(calibrationState.data)
    } catch (e: any) {
      const message = e?.response?.data?.error || 'Could not load nursery records. Check that the local backend is running.'
      setError(message)
      setLoadError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

  const handleFeedback = (feedback: Feedback, saved: boolean) => {
    setError(feedback.error || '')
    setNotice(feedback.notice || '')
    if (saved) void refresh()
  }

  const rodLength = calibration?.calibration?.configured_rod_length_cm ?? 30

  const speciesGroups = useMemo(() => Object.values(plants.reduce<Record<string, SpeciesGroup>>((groups, plant) => {
    const name = plant.species.trim()
    const key = name.toLocaleLowerCase()
    if (!groups[key]) groups[key] = { name, count: 0, varieties: new Set<string>(), latestDate: null }
    const group = groups[key]
    group.count += 1
    if (plant.variety?.trim()) group.varieties.add(plant.variety.trim())
    const date = plant.latest_observation?.observation_date
    if (date && (!group.latestDate || date > group.latestDate)) group.latestDate = date
    return groups
  }, {})).sort((a, b) => a.name.localeCompare(b.name)), [plants])

  const visiblePlants = selectedSpecies
    ? plants.filter(p => p.species.trim().toLocaleLowerCase() === selectedSpecies.toLocaleLowerCase())
    : plants

  return (
    <div className="nx" id="top" ref={rootRef}>
      <div className="nx-foliage" aria-hidden="true" />
      <NurseryNav />
      <main className="nx-container">
        <NurseryHero plantCount={plants.length} speciesCount={speciesGroups.length} rodLength={rodLength} />

        {error && error !== loadError && <div className="nx-alert nx-alert-error" role="alert">{error}</div>}
        {notice && <div className="nx-alert nx-alert-success" role="status">{notice}</div>}

        <NurseryShortcuts />

        <SpeciesLibrary
          groups={speciesGroups}
          references={referencePlants}
          selected={selectedSpecies}
          onSelect={name => {
            setSelectedSpecies(name)
            document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        />

        <PlantCollection
          plants={visiblePlants}
          totalCount={plants.length}
          loading={loading}
          loadError={loadError}
          selected={selectedSpecies}
          onClear={() => setSelectedSpecies(null)}
          onRefresh={() => void refresh()}
        />

        <ReferenceCohort plants={referencePlants} loading={loading} />

        <section className="nx-section" aria-label="Nursery tools">
          <div className="nx-tools">
            <AddPlantCard species={species} onDone={handleFeedback} />
            <MeasureCard plants={plants} rodLength={rodLength} onDone={handleFeedback} />
          </div>
        </section>

        <WeatherCard />

        <footer className="nx-footer">Leafora Nursery · Grown with care</footer>
      </main>
    </div>
  )
}
