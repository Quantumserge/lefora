export type Species = { species: string; varieties?: string[] }

export type Plant = {
  plant_id: number
  species: string
  variety?: string | null
  external_ref?: string | null
  date_started?: string | null
  latest_observation?: {
    observation_date: string
    height_cm: number | null
    stem_width_cm: number | null
    visible_true_leaf_count: number | null
    growth_rate_cm_per_day: number | null
  } | null
  growth_status: string
  record_count: number
  prediction?: {
    available?: boolean
    method?: string
    provisional?: boolean
    validated?: boolean
    model_name?: string | null
    algorithm_description?: string | null
    trajectory_model?: {
      display_name: string
      ready_for_evaluation: boolean
      current_independent_plants: number
      current_readiness_events: number
      minimum_independent_plants: number
      minimum_readiness_events: number
      note: string
    }
    days_remaining?: number
    predicted_readiness_date?: string
    message?: string
    days_remaining_uncertainty_days?: number
  } | null
}

export type ReferenceObservation = {
  observation_date: string
  age_days: number | null
  height_cm: number | null
  growth_rate_cm_per_day: number | null
  canopy_width_cm: number | null
  stem_width_cm: number | null
  visible_true_leaf_count: number | null
}

export type ReferencePlant = {
  plant_id: number
  species: string
  variety?: string | null
  external_ref?: string | null
  cohort: 'reference'
  record_count: number
  first_observation_date: string | null
  latest_observation: ReferenceObservation | null
  observations: ReferenceObservation[]
}

export type WeatherDay = {
  date: string
  condition: string
  high_c: number | null
  low_c: number | null
  rain_mm: number | null
  rain_probability_percent: number | null
  wind_kmh: number | null
  advisories: string[]
}

export type WeatherPlace = {
  name: string
  admin1: string
  country: string
  label: string
  latitude: number
  longitude: number
  timezone: string | null
}

export type Feedback = { notice?: string; error?: string }

export const today = () => new Date().toISOString().slice(0, 10)

// Illustration only. Plant names, measurements, and status always come from the backend.
export const plantImage = (_index: number) => '/nursery/plant-1.png'
