const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const hasNoContent = response.status === 204 || response.status === 205
  const data = !hasNoContent && contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    const detail = Array.isArray(data?.detail)
      ? data.detail.map((error) => error.msg).join(', ')
      : data?.detail
    throw new Error(detail || `Request failed (${response.status})`)
  }

  return data
}

export function apiFetch(path, options = {}, token = null) {
  const headers = {
    ...options.headers,
   ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return request(path, { ...options, headers })
}

export function registerUser(credentials) {
  return request('/register', { method: 'POST', body: JSON.stringify(credentials) })
}

export function loginUser({ email, password }) {
  const formData = new URLSearchParams({ username: email, password })
  return request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  })
}

export function getResumes(token) {
  return request('/resumes', { headers: { Authorization: `Bearer ${token}` } })
}
