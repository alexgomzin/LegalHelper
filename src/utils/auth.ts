import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'

// JWT secret (in production, this would be an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

// Function to verify a JWT token
export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
    return decoded
  } catch (error) {
    return null
  }
}

// Middleware to check if a user is authenticated
export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, user: UserPayload) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get token from authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' })
    }
    
    // Extract token
    const token = authHeader.split(' ')[1]
    
    // Verify token
    const user = verifyToken(token)
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' })
    }
    
    // Call the handler with user info
    return handler(req, res, user)
  }
}

// Get user from client-side
export function getAuthUser(): UserPayload | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const token = localStorage.getItem('authToken')
  
  if (!token) {
    return null
  }
  
  try {
    // In a real app, we'd validate this on the server
    // This is just a simple client-side check
    const decoded = jwt.decode(token) as UserPayload
    return decoded
  } catch (error) {
    return null
  }
} 