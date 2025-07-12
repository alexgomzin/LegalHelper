import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

type ResponseData = {
  success: boolean
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { apiKey } = req.body

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ success: false, error: 'API key is required' })
  }

  try {
    // Initialize OpenAI API client with the provided key
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Make a simple call to check if the API key is valid
    const models = await openai.models.list()
    
    // If we get here, the API key is valid
    return res.status(200).json({ success: true })
  } catch (error: any) {
    let message = 'Invalid API key or error connecting to OpenAI'
    
    if (error.response) {
      if (error.response.status === 401) {
        message = 'Invalid API key'
      } else {
        message = `OpenAI API error: ${error.response.status}`
      }
    }
    
    return res.status(400).json({ success: false, error: message })
  }
} 