const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

export async function loginUser({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()

  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: normalizedEmail,
      password
    })
  })
}

export async function registerUser({ name, email, password, role }) {
  const payload = {
    name: String(name || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    password,
    role
  }

  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function forgotPassword({ email }) {
  const payload = {
    email: String(email || '').trim().toLowerCase()
  }

  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
