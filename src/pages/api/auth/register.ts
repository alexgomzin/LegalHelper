import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import fs from 'fs/promises'
import path from 'path'
import { validateEmailForRegistration } from '@/utils/emailValidation'

// This would be replaced with a real database in production
const USERS_FILE = path.join(process.cwd(), 'users.json')

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

// Ensure users file exists
async function ensureUsersFile() {
  try {
    await fs.access(USERS_FILE)
  } catch (error) {
    // File doesn't exist, create it with an empty array
    await fs.writeFile(USERS_FILE, JSON.stringify([]))
  }
}

// Get all users
async function getUsers(): Promise<User[]> {
  await ensureUsersFile()
  const data = await fs.readFile(USERS_FILE, 'utf8')
  return JSON.parse(data)
}

// Save users
async function saveUsers(users: User[]) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
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
    const { name, email, password } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Validate email for temporary/disposable addresses
    const emailValidation = validateEmailForRegistration(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.error || 'Invalid email address' })
    }

    // Get existing users
    const users = await getUsers()

    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    // Add user to users array
    users.push(newUser)

    // Save updated users array
    await saveUsers(users)

    // Return success without sensitive data
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Server error during registration' })
  }
} 