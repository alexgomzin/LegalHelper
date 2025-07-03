import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'

// This would be replaced with a real database in production
const USERS_FILE = path.join(process.cwd(), 'users.json')

// JWT secret (in production, this would be an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

// Get all users
async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist or other error, return empty array
    return []
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' })
    }

    // Get all users
    const users = await getUsers()

    // Find user by email
    const user = users.find(u => u.email === email)

    // If user not found or password doesn't match
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    )

    // Return token and user info
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Server error during login' })
  }
} 