const STORAGE_KEYS = {
  token: 'authToken',
  user: 'authUser',
  email: 'userEmail',
  role: 'userRole'
}

export function getStoredAuthUser() {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEYS.user)
    if (!rawUser) {
      return null
    }

    const parsedUser = JSON.parse(rawUser)
    return parsedUser && typeof parsedUser === 'object' ? parsedUser : null
  } catch {
    return null
  }
}

export function getStoredToken() {
  return localStorage.getItem(STORAGE_KEYS.token)
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(STORAGE_KEYS.email))
}

export function getDefaultRouteForRole(role) {
  return role === 'manager' ? '/manager' : '/dashboard'
}

export function setStoredAuthSession({ token, user }) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.token, token)
  }

  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
  localStorage.setItem(STORAGE_KEYS.email, user.email)
  localStorage.setItem(STORAGE_KEYS.role, user.role)
  window.dispatchEvent(new Event('userChanged'))
}

export function clearStoredAuthSession() {
  Object.values(STORAGE_KEYS).forEach((storageKey) => {
    localStorage.removeItem(storageKey)
  })
  window.dispatchEvent(new Event('userChanged'))
}
