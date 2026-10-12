/**
 * Tiny fetch wrapper for the json-server backend.
 *
 * By default requests go to /api, which Vite proxies to http://localhost:3001
 * (see vite.config.js). To point at a deployed server instead, set
 * VITE_API_URL, e.g. VITE_API_URL=https://my-api.example.com
 */
const BASE = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError(
      'Cannot reach the data server. Start it with "npm run dev" (or "npm run api") and try again.',
      0,
    )
  }
  if (!response.ok) throw new ApiError(`Request failed (${response.status}).`, response.status)
  return response.status === 204 ? null : response.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (path) => request(path, { method: 'DELETE' }),
}
