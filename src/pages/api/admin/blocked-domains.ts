import { NextApiRequest, NextApiResponse } from 'next'
import { getBlockedDomains, addBlockedDomain } from '@/utils/emailValidation'

// Admin email for authorization
const ADMIN_EMAIL = 'g0mzinaldo@yandex.ru'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Basic auth check - in production, you'd use proper JWT validation
  const { authorization } = req.headers
  
  // For now, just check if admin email is provided
  // In production, implement proper authentication
  if (!authorization || !authorization.includes(ADMIN_EMAIL)) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    // Get all blocked domains
    try {
      const blockedDomains = getBlockedDomains()
      return res.status(200).json({
        success: true,
        domains: blockedDomains,
        count: blockedDomains.length
      })
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching blocked domains' })
    }
  }

  if (req.method === 'POST') {
    // Add a new blocked domain
    try {
      const { domain } = req.body
      
      if (!domain) {
        return res.status(400).json({ message: 'Domain is required' })
      }

      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
      if (!domainRegex.test(domain)) {
        return res.status(400).json({ message: 'Invalid domain format' })
      }

      addBlockedDomain(domain)
      
      return res.status(200).json({
        success: true,
        message: `Domain ${domain} added to blocked list`,
        domain
      })
    } catch (error) {
      return res.status(500).json({ message: 'Error adding blocked domain' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
} 