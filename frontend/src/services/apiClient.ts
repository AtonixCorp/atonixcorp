import axios from 'axios'

const _API_BASE = process.env.REACT_APP_API_URL || ''

const client = axios.create({
  baseURL: _API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Add request interceptor to include auth token if available
let _currentToken: string | null = null

export function setAuthToken(token: string | null) {
  _currentToken = token
  if (token) {
    client.defaults.headers = client.defaults.headers || {}
    client.defaults.headers.Authorization = `Bearer ${token}`
  } else if (client.defaults.headers) {
    delete (client.defaults.headers as any).Authorization
  }
}

// initialize from localStorage if present for backward compatibility
_currentToken = localStorage.getItem('authToken')
if (_currentToken) setAuthToken(_currentToken)

client.interceptors.request.use(
  (config) => {
    if (_currentToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${_currentToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export function clearAuthToken() {
  _currentToken = null
  if (client.defaults.headers) {
    delete (client.defaults.headers as any).Authorization
  }
}

export default client
