import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: '7d' }
  )
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }
}

export async function register(request, response) {
  const name = String(request.body.name || '').trim()
  const email = String(request.body.email || '').trim().toLowerCase()
  const password = String(request.body.password || '')
  const role = String(request.body.role || 'client').trim()

  if (!name || !email || !password) {
    return response.status(400).json({
      message: 'Name, email, and password are required.'
    })
  }

  if (password.length < 8) {
    return response.status(400).json({
      message: 'Password must be at least 8 characters long.'
    })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return response.status(409).json({
      message: 'A user with this email already exists.'
    })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: ['client', 'manager', 'member'].includes(role) ? role : 'client'
  })

  return response.status(201).json({
    message: 'User created successfully.',
    token: createToken(user),
    user: sanitizeUser(user)
  })
}

export async function login(request, response) {
  const email = String(request.body.email || '').trim().toLowerCase()
  const password = String(request.body.password || '')

  if (!email || !password) {
    return response.status(400).json({
      message: 'Email and password are required.'
    })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return response.status(401).json({
      message: 'Invalid email or password.'
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    return response.status(401).json({
      message: 'Invalid email or password.'
    })
  }

  return response.status(200).json({
    message: 'Login successful.',
    token: createToken(user),
    user: sanitizeUser(user)
  })
}

export async function forgotPassword(request, response) {
  const email = String(request.body.email || '').trim().toLowerCase()

  if (!email) {
    return response.status(400).json({
      message: 'Email is required.'
    })
  }

  return response.status(200).json({
    message: 'If an account exists for this email, a reset link would be sent.'
  })
}
