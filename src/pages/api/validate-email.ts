import { NextApiRequest, NextApiResponse } from 'next'
import { validateEmailForRegistration, isTemporaryEmail } from '@/utils/emailValidation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ 
        isValid: false, 
        error: 'Email is required' 
      })
    }

    // Validate the email
    const validation = validateEmailForRegistration(email)
    
    // Additional server-side checks can be added here
    // For example, checking against a real-time API of disposable email services
    
    return res.status(200).json({
      isValid: validation.isValid,
      error: validation.error,
      isTemporary: isTemporaryEmail(email),
      domain: email.split('@')[1]?.toLowerCase()
    })
  } catch (error) {
    console.error('Email validation error:', error)
    return res.status(500).json({ 
      isValid: false, 
      error: 'Server error during validation' 
    })
  }
} 