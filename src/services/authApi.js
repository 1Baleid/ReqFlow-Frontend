import { demoUsers } from '../data/mockData'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const LOCAL_AUTH_USERS_KEY = 'reqflow-local-auth-users-v1'

function createError(message, status = 500) {
  const error = new Error(message)
  error.status = status
  return error
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw createError(data.message || 'Request failed.', response.status)
  }

  return data
}

function resolveDemoLogin(email, password) {
  const demoUser = demoUsers[email]
  const demoPasswords = {
    'abdullah@kfupm.edu.sa': 'abdullah123',
    'khalid@kfupm.edu.sa': 'khalid123',
    'omar@kfupm.edu.sa': 'omar123'
  }

  if (!demoUser || demoPasswords[email] !== password) {
    throw createError('Invalid email or password.', 401)
  }

  return {
    message: 'Login successful.',
    token: 'demo-token',
    user: demoUser
  }
}

function getRoleTitle(role) {
  const titles = {
    client: 'Project Owner',
    manager: 'Project Manager',
    member: 'Team Member'
  }

  return titles[role] || 'Project Owner'
}

function loadLocalAuthUsers() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedUsers = window.localStorage.getItem(LOCAL_AUTH_USERS_KEY)
    const parsedUsers = JSON.parse(storedUsers || '[]')
    return Array.isArray(parsedUsers) ? parsedUsers : []
  } catch {
    return []
  }
}

function persistLocalAuthUsers(users) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users))
}

function resolveLocalLogin(email, password) {
  const localUser = loadLocalAuthUsers().find((user) => user.email === email)

  if (!localUser || localUser.password !== password) {
    throw createError('Invalid email or password.', 401)
  }

  return {
    message: 'Login successful.',
    token: 'local-demo-token',
    user: localUser.user
  }
}

function resolveLocalRegister({ name, email, password, role }) {
  const existingDemoUser = demoUsers[email]
  const localUsers = loadLocalAuthUsers()
  const existingLocalUser = localUsers.find((user) => user.email === email)

  if (existingDemoUser || existingLocalUser) {
    throw createError('A user with this email already exists.', 409)
  }

  const normalizedRole = ['client', 'manager', 'member'].includes(role) ? role : 'client'
  const user = {
    id: `local-user-${Date.now()}`,
    name: String(name || '').trim(),
    email,
    role: normalizedRole,
    title: getRoleTitle(normalizedRole),
    createdAt: new Date().toISOString()
  }

  persistLocalAuthUsers([
    ...localUsers,
    {
      email,
      password,
      user
    }
  ])

  return {
    message: 'User created successfully.',
    token: 'local-demo-token',
    user
  }
}

function resolveLocalForgotPassword({ email }) {
  const localUsers = loadLocalAuthUsers()
  const userExists = Boolean(demoUsers[email]) || localUsers.some((user) => user.email === email)

  return {
    message: userExists
      ? 'If an account exists for this email, a reset link would be sent.'
      : 'If an account exists for this email, a reset link would be sent.'
  }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()

  try {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: normalizedEmail,
        password
      })
    })
  } catch (error) {
    if (error instanceof TypeError || (error.status === 401 && demoUsers[normalizedEmail])) {
      try {
        return resolveDemoLogin(normalizedEmail, password)
      } catch {
        return resolveLocalLogin(normalizedEmail, password)
      }
    }

    if (error instanceof TypeError || error.status === 401) {
      return resolveLocalLogin(normalizedEmail, password)
    }

    throw error
  }
}

export async function registerUser({ name, email, password, role }) {
  const payload = {
    name: String(name || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    password,
    role
  }

  try {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  } catch (error) {
    if (error instanceof TypeError) {
      return resolveLocalRegister(payload)
    }

    throw error
  }
}

export async function forgotPassword({ email }) {
  const payload = {
    email: String(email || '').trim().toLowerCase()
  }

  try {
    return await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  } catch (error) {
    if (error instanceof TypeError) {
      return resolveLocalForgotPassword(payload)
    }

    throw error
  }
}
