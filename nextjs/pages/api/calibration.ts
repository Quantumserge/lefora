import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const result = await axios.get(`${BACKEND}/api/calibration`)
      return res.status(200).json(result.data)
    }
    if (req.method === 'POST') {
      const result = await axios.post(`${BACKEND}/api/calibration`, req.body)
      return res.status(result.status).json(result.data)
    }
  } catch (error: any) {
    return res.status(error.response?.status || 502).json(
      error.response?.data || { error: 'Calibration service is unavailable. Start the Flask backend.' },
    )
  }
  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method Not Allowed' })
}
