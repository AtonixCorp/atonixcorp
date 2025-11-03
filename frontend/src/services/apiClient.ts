import axios from 'axios'

const __API_BASE = process.env.REACT_APP_API_URL || ''

const client = axios.create({
  baseURL: __API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Add request interceptor to include auth token if available
let __currentToken: string | null = null

export function setAuthToken(token: string | null) {
  __currentToken = token
  if (token) {
    client.defaults.headers = client.defaults.headers || {}
    client.defaults.headers.Authorization = `Bearer ${token}`
  } else if (client.defaults.headers) {
    delete (client.defaults.headers as any).Authorization
  }
}

// initialize from localStorage if present for backward compatibility
__currentToken = localStorage.getItem('authToken')
if (__currentToken) setAuthToken(__currentToken)

client.interceptors.request.use(
  (config) => {
    if (__currentToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${__currentToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export function clearAuthToken() {
  __currentToken = null
  if (client.defaults.headers) {
    delete (client.defaults.headers as any).Authorization
  }
}

export default client
