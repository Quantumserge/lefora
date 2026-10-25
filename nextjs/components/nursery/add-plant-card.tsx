'use client'

import { FormEvent, useState } from 'react'
import axios from 'axios'
import { Feedback, Species, today } from './types'

export function AddPlantCard({ species, onDone }: { species: Species[]; onDone: (feedback: Feedback, saved: boolean) => void }) {
  const [busy, setBusy] = useState(false)
  const [newSpecies, setNewSpecies] = useState('')
  const [newVariety, setNewVariety] = useState('')
  const [newRef, setNewRef] = useState('')
  const [started, setStarted] = useState(today)

  const registerPlant = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await axios.post('/api/plants', {
        species: newSpecies,
        variety: newVariety || null,
        external_ref: newRef || null,
        date_started: started || null,
        data_source: 'real',
      })
      setNewVariety(''); setNewRef('')
      onDone({ notice: 'Plant added to nursery inventory.' }, true)
    } catch (e: any) {
      onDone({ error: e?.response?.data?.error || 'Could not add this plant.' }, false)
    } finally { setBusy(false) }
  }

  return (
    <div className="nx-card" id="add-plant">
      <div className="nx-tool-head">
        <span className="nx-tool-num">01</span>
        <div><p className="nx-eyebrow">Grow your collection</p><h2 className="nx-card-title">Add a plant</h2></div>
      </div>
      <p className="nx-help">Only species with recorded measurements are listed. The camera measures plants; it does not identify them.</p>
      <form onSubmit={registerPlant} className="nx-form">
        <label className="nx-field">Species
          <select className="nx-input" required value={newSpecies} onChange={e => setNewSpecies(e.target.value)}>
            <option value="">Choose a plant</option>
            {species.map(item => <option key={item.species} value={item.species}>{item.species}</option>)}
          </select>
        </label>
        <label className="nx-field">Variety
          <input className="nx-input" value={newVariety} onChange={e => setNewVariety(e.target.value)} placeholder="Optional" />
        </label>
        <label className="nx-field">Plant label / row
          <input className="nx-input" value={newRef} onChange={e => setNewRef(e.target.value)} placeholder="Optional, e.g. Tray A · 04" />
        </label>
        <label className="nx-field">Date planted
          <input className="nx-input" type="date" value={started} onChange={e => setStarted(e.target.value)} />
        </label>
        {species.length === 0 && <p className="nx-empty-inline">No species with measured data are available yet.</p>}
        <button className="nx-btn nx-btn-block" disabled={busy || !newSpecies || species.length === 0}>
          {busy ? 'Saving…' : 'Add to nursery'}
        </button>
      </form>
    </div>
  )
}
