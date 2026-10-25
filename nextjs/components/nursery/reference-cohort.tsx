import { ReferenceObservation, ReferencePlant } from './types'

export function ReferenceCohort({ plants, loading }: {
  plants: ReferencePlant[]
  loading: boolean
}) {
  if (loading || plants.length === 0) return null

  const observationCount = plants.reduce((total, plant) => total + plant.record_count, 0)

  return (
    <section className="nx-section" id="reference-data" aria-labelledby="reference-data-title">
      <div className="nx-section-head">
        <div>
          <p className="nx-eyebrow">Historical growth data</p>
          <h2 id="reference-data-title">Super Orange reference cohort</h2>
          <p>Measured reference plants used for growth comparisons. They are not active nursery stock, and their successful growth history does not prove an optimal transplant date.</p>
        </div>
        <span className="nx-badge">{plants.length} plants · {observationCount} measurements</span>
      </div>

      <div className="nx-reference-grid">
        {plants.map((plant, index) => (
          <ReferencePlantCard key={plant.plant_id} plant={plant} index={index} />
        ))}
      </div>
    </section>
  )
}

function ReferencePlantCard({ plant, index }: { plant: ReferencePlant; index: number }) {
  const latest = plant.latest_observation

  return (
    <article className="nx-reference-card" id={`reference-plant-${plant.plant_id}`}>
      <div className="nx-reference-card-head">
        <div>
          <p className="nx-reference-kicker">REFERENCE PLANT {String(index + 1).padStart(2, '0')}</p>
          <h3>{plant.external_ref || `Plant ${plant.plant_id}`}</h3>
        </div>
        <span className="nx-reference-tag">Historical</span>
      </div>

      <p className="nx-reference-species">{plant.species}{plant.variety ? ` · ${plant.variety}` : ''}</p>
      <div className="nx-reference-stats">
        <div><span>Latest height</span><strong>{formatCm(latest?.height_cm)}</strong></div>
        <div><span>Latest record</span><strong>{latest?.observation_date || '—'}</strong></div>
        <div><span>Measurements</span><strong>{plant.record_count}</strong></div>
      </div>

      <details className="nx-reference-details">
        <summary>View all {plant.observations.length} measurements</summary>
        <div className="nx-reference-table-wrap">
          <table className="nx-reference-table">
            <thead>
              <tr><th>Date</th><th>Age</th><th>Height</th><th>Growth rate</th></tr>
            </thead>
            <tbody>
              {plant.observations.map((observation, rowIndex) => (
                <MeasurementRow key={`${plant.plant_id}-${observation.observation_date}-${rowIndex}`} observation={observation} />
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </article>
  )
}

function MeasurementRow({ observation }: { observation: ReferenceObservation }) {
  return (
    <tr>
      <td>{observation.observation_date}</td>
      <td>{observation.age_days == null ? '—' : `${observation.age_days} d`}</td>
      <td>{formatCm(observation.height_cm)}</td>
      <td>{observation.growth_rate_cm_per_day == null ? '—' : `${observation.growth_rate_cm_per_day.toFixed(2)} cm/d`}</td>
    </tr>
  )
}

function formatCm(value: number | null | undefined) {
  return value == null ? '—' : `${value.toFixed(1)} cm`
}
