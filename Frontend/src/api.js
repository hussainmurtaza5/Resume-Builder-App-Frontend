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
    const error = new Error(detail || `Request failed (${response.status})`)
    error.status = response.status
    throw error
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

export function getCurrentUser(token) {
  return apiFetch('/users/me', {}, token)
}

export function getResumes(token) {
  return request('/resumes', { headers: { Authorization: `Bearer ${token}` } })
}

export function getResume(resumeId, token) {
  return apiFetch(`/resumes/${resumeId}`, {}, token)
}

export function deleteResume(resumeId, token) {
  return apiFetch(`/resumes/${resumeId}`, { method: 'DELETE' }, token)
}

export function duplicateResume(resumeId, overrides = {}, token) {
  return apiFetch(`/resumes/${resumeId}/duplicate`, {
    method: 'POST',
    body: JSON.stringify(overrides),
  }, token)
}

export function exportResumeJson(resumeId, token) {
  return apiFetch(`/resumes/${resumeId}/export/json`, {}, token)
}

export function reorderResumeSection(resumeId, section, ids, token) {
  return apiFetch(`/resumes/${resumeId}/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ section, ids }),
  }, token)
}

export function createResumeSection(resumeId, section, payload, token) {
  return apiFetch(`/resumes/${resumeId}/${section}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export function listResumeSection(resumeId, section, token) {
  return apiFetch(`/resumes/${resumeId}/${section}`, {}, token)
}

export function updateResumeSection(resumeId, section, itemId, payload, token) {
  return apiFetch(`/resumes/${resumeId}/${section}/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token)
}

export function deleteResumeSection(resumeId, section, itemId, token) {
  return apiFetch(`/resumes/${resumeId}/${section}/${itemId}`, {
    method: 'DELETE',
  }, token)
}

export function rewriteBullet(payload, token) {
  return apiFetch('/ai/rewrite-bullet-xyz', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export function tailorResume(payload, token) {
  return apiFetch('/ai/tailor-resume', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export function createApplication(payload, token) {
  return apiFetch('/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export function getApplications(token, status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiFetch(`/applications${query}`, {}, token)
}

export function getApplication(applicationId, token) {
  return apiFetch(`/applications/${applicationId}`, {}, token)
}

export function updateApplication(applicationId, payload, token) {
  return apiFetch(`/applications/${applicationId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token)
}

export function deleteApplication(applicationId, token) {
  return apiFetch(`/applications/${applicationId}`, { method: 'DELETE' }, token)
}

export function analyzeApplication(applicationId, token) {
  return apiFetch(`/applications/${applicationId}/analyze`, { method: 'POST' }, token)
}

export function suggestSkills(payload, token) {
  return apiFetch('/ai/suggest-skills', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}
