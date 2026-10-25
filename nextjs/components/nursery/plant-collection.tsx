import { useCallback, useEffect, useRef, useState } from 'react'
import { Plant, plantImage, ReferencePlant } from './types'

export type SpeciesGroup = { name: string; count: number; varieties: Set<string>; latestDate: string | null }

function predictionMethodLabel(prediction: NonNullable<Plant['prediction']>) {
  if (prediction.model_name === 'plant_balanced_trajectory_similarity') {
    return `Plant-Balanced Trajectory Similarity (PBTS) v1${prediction.validated ? ' · validated' : ' · experimental'}`
  }
  if (prediction.provisional) return 'Provisional historical baseline'
  if (prediction.method === 'validated_model') return 'Validated model'
  return prediction.method || 'Method not reported'
}

export function SpeciesLibrary({ groups, references, selected, onSelect }: {
  groups: SpeciesGroup[]
  references: ReferencePlant[]
  selected: string | null
  onSelect: (name: string) => void
}) {
  const readyExamples = references.slice(0, 2)

  return (
    <section className="nx-section" id="library" aria-labelledby="library-title">
      <div className="nx-section-head">
        <div>
          <p className="nx-eyebrow">Ready to explore</p>
          <h2 id="library-title">Plant library</h2>
          <p>Two measured plant records are ready to view. No photo upload is needed to get started.</p>
        </div>
        <span className="nx-badge">{readyExamples.length} ready {readyExamples.length === 1 ? 'record' : 'records'}</span>
      </div>
      {readyExamples.length > 0 && <div className="nx-library-ready-grid">
        {readyExamples.map((plant, index) => <a
          className="nx-library-ready"
          key={plant.plant_id}
          href={`#reference-plant-${plant.plant_id}`}
          aria-label={`View historical measurements for ${plant.external_ref || `reference plant ${index + 1}`}`}
        >
          <span className="nx-library-ready-art" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M32 53V26m0 12c-10 0-17-6-18-16 10 0 17 5 18 16Zm0-7c10 0 17-6 18-16-10 0-17 5-18 16Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 53h18M27 59h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M15 53h34l-3 6H18l-3-6Z" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="nx-library-ready-body">
            <span className="nx-library-ready-kicker">HISTORICAL REFERENCE · {String(index + 1).padStart(2, '0')}</span>
            <strong>{plant.external_ref || `Plant ${plant.plant_id}`}</strong>
            <span>{plant.species}{plant.variety ? ` · ${plant.variety}` : ''}</span>
            <small>{plant.record_count} measured records · Latest height {formatLibraryHeight(plant.latest_observation?.height_cm)}</small>
          </span>
          <span className="nx-library-ready-arrow" aria-hidden="true">↗</span>
        </a>)}
      </div>}
      <div className="nx-library-current-head">
        <h3>Currently monitored</h3>
        <span>{groups.length} species</span>
      </div>
      {groups.length === 0
        ? <div className="nx-empty-inline">Your two historical examples are ready above. Add a nursery plant whenever you want to start tracking your own stock.</div>
        : <div className="nx-species-grid">
          {groups.map((item, index) => {
            const active = selected?.toLocaleLowerCase() === item.name.toLocaleLowerCase()
            return (
              <button type="button" key={item.name.toLocaleLowerCase()} className="nx-species" aria-pressed={active} onClick={() => onSelect(item.name)}>
                <span className="nx-species-img" aria-hidden="true"><img src={plantImage(index)} alt="" /></span>
                <span className="nx-species-info">
                  <strong>{item.name}</strong>
                  <span>{item.count} monitored plant{item.count === 1 ? '' : 's'}</span>
                  {item.varieties.size > 0 && <small>{item.varieties.size} recorded variet{item.varieties.size === 1 ? 'y' : 'ies'}</small>}
                  <small>{item.latestDate ? `Last measured ${item.latestDate}` : 'No measurements yet'}</small>
                </span>
                <span className="nx-species-arrow" aria-hidden="true">↗</span>
              </button>
            )
          })}
        </div>}
    </section>
  )
}

function formatLibraryHeight(value: number | null | undefined) {
  return value == null ? 'not recorded' : `${value.toFixed(1)} cm`
}

export function PlantCollection({ plants, totalCount, loading, loadError, selected, onClear, onRefresh }: {
  plants: Plant[]
  totalCount: number
  loading: boolean
  loadError: string
  selected: string | null
  onClear: () => void
  onRefresh: () => void
}) {
  const [openedPlant, setOpenedPlant] = useState<Plant | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const closeDetails = useCallback(() => {
    setOpenedPlant(null)
    window.requestAnimationFrame(() => openerRef.current?.focus())
  }, [])

  return (
    <section className="nx-section" id="inventory" aria-labelledby="inventory-title">
      <div className="nx-section-head">
        <div>
          <p className="nx-eyebrow">Your collection</p>
          <h2 id="inventory-title">{selected || 'Plants in your nursery'}</h2>
          <p>{selected ? `Showing monitored ${selected} plants.` : 'A little check-in goes a long way.'}</p>
        </div>
        <div className="nx-head-actions">
          {selected && <button type="button" className="nx-link" onClick={onClear}>Show all</button>}
          <button type="button" className="nx-link" onClick={onRefresh}>Refresh <span aria-hidden="true">→</span></button>
        </div>
      </div>

      {loading
        ? <div className="nx-empty" role="status">Loading your nursery records…</div>
        : loadError
        ? <div className="nx-empty" role="alert"><strong>Nursery records aren’t available</strong><span>{loadError}</span><button type="button" className="nx-btn nx-btn-sm" onClick={onRefresh}>Try again</button></div>
        : plants.length === 0
        ? <div className="nx-empty">
          <span className="nx-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 4C11 4 5 7 5 13c0 3.3 2.3 5 5 5 6 0 9-6 10-14ZM4 21c2-6 6-9 12-12" /></svg></span>
          <strong>{totalCount === 0 ? 'Your nursery is ready to grow' : 'No monitored plants found'}</strong>
          <span>{totalCount === 0 ? 'Add your first plant to start tracking it here.' : 'Choose another species from your nursery library.'}</span>
          {totalCount === 0 && <a className="nx-btn nx-btn-sm" href="#add-plant">Add first plant</a>}
        </div>
        : <div className="nx-plant-grid">{plants.map((plant, index) => <PlantCard
          key={plant.plant_id}
          plant={plant}
          index={index}
          onOpen={opener => { openerRef.current = opener; setOpenedPlant(plant) }}
        />)}</div>}

      <p className="nx-footnote">Historical reference plants appear separately below and are not counted as current nursery stock. Missing feedback stays pending; it is never counted as failure.</p>
      {openedPlant && <PlantDetails plant={openedPlant} onClose={closeDetails} />}
    </section>
  )
}

function PlantCard({ plant, index, onOpen }: { plant: Plant; index: number; onOpen: (opener: HTMLElement) => void }) {
  const prediction = plant.prediction
  const obs = plant.latest_observation
  const hasPrediction = prediction?.available
  const tone = /stress|slow|declin|attention/i.test(plant.growth_status) ? 'is-attention' : 'is-calm'
  const title = plant.external_ref || `${plant.species} #${plant.plant_id}`

  const readinessTitle = hasPrediction
    ? prediction!.days_remaining != null
      ? `${Math.max(0, Math.round(prediction!.days_remaining))} days to readiness`
      : prediction!.predicted_readiness_date || 'Ready estimate available'
    : 'Readiness estimate pending'
  const readinessDetail = hasPrediction
    ? `${predictionMethodLabel(prediction!)}${prediction!.days_remaining_uncertainty_days != null ? ` · ±${Math.round(prediction!.days_remaining_uncertainty_days)} days` : ''}`
    : prediction?.message || 'More dated measurements are needed.'

  return (
    <article
      className="nx-plant"
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`View details for ${title}`}
      onClick={event => onOpen(event.currentTarget)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(event.currentTarget)
        }
      }}
    >
      <div className="nx-plant-art">
        <img src={plantImage(index)} alt="" loading="lazy" />
        <span className="nx-plant-num">PLANT {String(index + 1).padStart(2, '0')}</span>
        <span className={`nx-state ${tone}`} title="Recorded growth status">{plant.growth_status.replace(/_/g, ' ')}</span>
      </div>
      <div className="nx-plant-body">
        <div className="nx-plant-title">
          <div>
            <h3>{title}</h3>
            <p>{plant.species}{plant.variety ? ` · ${plant.variety}` : ''}</p>
          </div>
          <span className="nx-round" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </div>
        <div className="nx-metrics">
          <div><span>Height</span><strong>{obs?.height_cm == null ? '—' : `${obs.height_cm} cm`}</strong></div>
          <div><span>Last check</span><strong>{obs?.observation_date || 'Not measured'}</strong></div>
        </div>
        <div className="nx-ready">
          <span className="nx-ready-dot" aria-hidden="true" />
          <div><strong>{readinessTitle}</strong><small>{readinessDetail}</small></div>
        </div>
      </div>
    </article>
  )
}

function PlantDetails({ plant, onClose }: { plant: Plant; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const observation = plant.latest_observation
  const prediction = plant.prediction
  const title = plant.external_ref || `${plant.species} #${plant.plant_id}`

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const readinessText = prediction?.available
    ? prediction.days_remaining != null
      ? `${Math.max(0, Math.round(prediction.days_remaining))} days remaining`
      : prediction.predicted_readiness_date || 'Estimate available'
    : prediction?.message || 'Insufficient dated measurements for an estimate.'
  const methodText = prediction ? predictionMethodLabel(prediction) : 'Method not reported'

  return (
    <div
      className="nx-modal-backdrop"
      role="presentation"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}
    >
      <section className="nx-modal" role="dialog" aria-modal="true" aria-labelledby="nx-details-title" tabIndex={-1}>
        <div className="nx-modal-art">
          <img src={plantImage(0)} alt="" />
          <span className="nx-modal-art-label">Decorative illustration</span>
          <button ref={closeButtonRef} type="button" className="nx-modal-close" onClick={onClose} aria-label="Close plant details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="nx-modal-body">
          <p className="nx-eyebrow">Nursery record · #{plant.plant_id}</p>
          <h2 id="nx-details-title">{title}</h2>
          <p className="nx-modal-species">{plant.species}{plant.variety ? ` · ${plant.variety}` : ''}</p>
          <dl className="nx-modal-metrics">
            <div><dt>Height</dt><dd>{observation?.height_cm == null ? 'Not recorded' : `${observation.height_cm} cm`}</dd></div>
            <div><dt>Stem width</dt><dd>{observation?.stem_width_cm == null ? 'Not recorded' : `${observation.stem_width_cm} cm`}</dd></div>
            <div><dt>True leaves</dt><dd>{observation?.visible_true_leaf_count == null ? 'Not recorded' : observation.visible_true_leaf_count}</dd></div>
            <div><dt>Growth rate</dt><dd>{observation?.growth_rate_cm_per_day == null ? 'Not available' : `${observation.growth_rate_cm_per_day} cm/day`}</dd></div>
            <div><dt>Last measured</dt><dd>{observation?.observation_date || 'No measurement yet'}</dd></div>
            <div><dt>Measurements</dt><dd>{plant.record_count}</dd></div>
          </dl>
          <div className="nx-modal-readiness">
            <span className="nx-ready-dot" aria-hidden="true" />
            <div>
              <strong>{readinessText}</strong>
              <small>{prediction?.available ? methodText : prediction?.message || 'This plant needs more dated measurements.'}</small>
              {prediction?.algorithm_description && <small>{prediction.algorithm_description}</small>}
              {prediction?.trajectory_model && prediction.model_name !== 'plant_balanced_trajectory_similarity' && (
                <small>
                  {prediction.trajectory_model.display_name} ·{' '}
                  {prediction.trajectory_model.current_readiness_events}/
                  {prediction.trajectory_model.minimum_readiness_events} verified
                  readiness events ·{' '}
                  {prediction.trajectory_model.current_independent_plants}/
                  {prediction.trajectory_model.minimum_independent_plants} plants
                </small>
              )}
              {prediction?.days_remaining_uncertainty_days != null && <small>Estimated uncertainty: ±{Math.round(prediction.days_remaining_uncertainty_days)} days</small>}
            </div>
          </div>
          <p className="nx-modal-note">Plant information comes from saved nursery records. The illustration does not identify the species.</p>
        </div>
      </section>
    </div>
  )
}
