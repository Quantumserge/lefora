'use client'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Feedback, Plant, today } from './types'

export function MeasureCard({ plants, rodLength, onDone }: {
  plants: Plant[]
  rodLength: number
  onDone: (feedback: Feedback, saved: boolean) => void
}) {
  const [busy, setBusy] = useState(false)
  const [plantId, setPlantId] = useState('')
  const [obsDate, setObsDate] = useState(today)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const cameraStream = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (cameraActive && videoRef.current && cameraStream.current) {
      videoRef.current.srcObject = cameraStream.current
      void videoRef.current.play().catch(() => setCameraError('Camera preview did not start. Use the photo picker below instead.'))
    }
  }, [cameraActive])

  useEffect(() => {
    if (!photo) { setPhotoPreview(''); return }
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  useEffect(() => () => { cameraStream.current?.getTracks().forEach(track => track.stop()) }, [])

  const stopCamera = () => {
    cameraStream.current?.getTracks().forEach(track => track.stop())
    cameraStream.current = null
    setCameraActive(false)
  }

  const startCamera = async () => {
    setCameraError('')
    setPhoto(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live camera is unavailable here. Use the photo picker below to open your phone camera.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1600 }, height: { ideal: 1200 } },
      })
      cameraStream.current = stream
      setCameraActive(true)
    } catch (e: any) {
      setCameraError(e?.name === 'NotAllowedError'
        ? 'Camera access was blocked. Allow camera access for this site, or use the photo picker below.'
        : 'Could not open the rear camera. Use the photo picker below instead.')
    }
  }

  const takeCameraPhoto = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera is still starting. Try again in a moment.')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) { setCameraError('Could not capture this frame. Use the photo picker below.'); return }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => {
      if (!blob) { setCameraError('Could not save this camera frame. Try again or use the photo picker.'); return }
      setPhoto(new File([blob], `plant-${plantId || 'capture'}-${obsDate}.jpg`, { type: 'image/jpeg' }))
      setCameraError('')
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const uploadCapture = async (event: FormEvent) => {
    event.preventDefault()
    if (!photo) { onDone({ error: 'Take a camera photo or choose an image first.' }, false); return }
    setBusy(true)
    stopCamera()
    try {
      const form = new FormData()
      form.append('image', photo)
      form.append('plant_id', plantId)
      form.append('observation_date', obsDate)
      const result = await axios.post('/api/camera/capture', form)
      const m = result.data.measurement
      setPhoto(null)
      if (fileRef.current) fileRef.current.value = ''
      onDone({ notice: `Measurement saved with the fixed ${result.data.rod_length_cm} cm reference rod: ${m.height_cm} cm tall; ${m.visible_true_leaf_count} visible leaves.` }, true)
    } catch (e: any) {
      onDone({ error: e?.response?.data?.error || 'Photo measurement failed. Make sure the entire bright red rod is visible beside the plant.' }, false)
    } finally { setBusy(false) }
  }

  const onPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    setPhoto(event.target.files?.[0] || null)
    setCameraError('')
    stopCamera()
  }

  return (
    <div className="nx-card" id="measure">
      <div className="nx-tool-head">
        <span className="nx-tool-num">02</span>
        <div><p className="nx-eyebrow">Keep an eye on growth</p><h2 className="nx-card-title">Measure a plant</h2></div>
      </div>
      <p className="nx-help">Use your phone&apos;s rear camera with the fixed {rodLength} cm red reference rod in frame.</p>
      <div className="nx-rod"><i aria-hidden="true" />Fixed measuring reference · {rodLength} cm</div>
      <form onSubmit={uploadCapture} className="nx-form">
        <label className="nx-field">Plant
          <select className="nx-input" required value={plantId} onChange={e => setPlantId(e.target.value)}>
            <option value="">Choose a nursery plant</option>
            {plants.map(p => <option key={p.plant_id} value={p.plant_id}>#{p.plant_id} · {p.external_ref || p.species}{p.variety ? ` · ${p.variety}` : ''}</option>)}
          </select>
        </label>
        <label className="nx-field">Photo date
          <input className="nx-input" type="date" required value={obsDate} onChange={e => setObsDate(e.target.value)} />
        </label>
        <div className="nx-camera-actions">
          {!cameraActive
            ? <button type="button" className="nx-btn nx-ghost" onClick={() => void startCamera()} disabled={busy}>Open phone camera</button>
            : <button type="button" className="nx-btn" onClick={takeCameraPhoto}>Take photo</button>}
          {cameraActive && <button type="button" className="nx-btn nx-ghost" onClick={stopCamera}>Close camera</button>}
        </div>
        {cameraActive && <div className="nx-camera">
          <video ref={videoRef} autoPlay playsInline muted aria-label="Live rear camera preview" />
          <div className="nx-camera-hint">Keep the full plant and vertical red rod inside the frame.</div>
        </div>}
        {photoPreview && <div className="nx-review">
          <img src={photoPreview} alt="Photo ready for plant measurement" />
          <button type="button" className="nx-btn nx-ghost nx-btn-sm" onClick={() => { setPhoto(null); void startCamera() }}>Retake</button>
        </div>}
        {cameraError && <div className="nx-camera-help" role="status">{cameraError}</div>}
        <label className="nx-field">Or choose a photo
          <input ref={fileRef} className="nx-input" type="file" accept="image/*" capture="environment" onChange={onPhoto} />
        </label>
        <button className="nx-btn nx-btn-block" disabled={busy || !plantId}>{busy ? 'Measuring…' : 'Measure and save'}</button>
      </form>
      <p className="nx-privacy">The image is processed for measurement and discarded. Its date and measurements are saved to this project&apos;s local database.</p>
    </div>
  )
}
