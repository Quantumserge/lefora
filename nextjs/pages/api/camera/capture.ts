import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export const config = { api: { bodyParser: false } }
const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  try {
    const result = await axios.post(`${BACKEND}/api/camera/capture`, req, {
      headers: { 'Content-Type': req.headers['content-type'] || 'multipart/form-data' },
      maxBodyLength: 12 * 1024 * 1024,
      maxContentLength: 12 * 1024 * 1024,
      validateStatus: () => true,
    })
    return res.status(result.status).json(result.data)
  } catch (error: any) {
    return res.status(502).json({ error: 'Camera service is unavailable. Start the Flask backend.' })
  }
}
