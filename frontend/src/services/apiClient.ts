import axios from 'axios'

const ____API_BASE = process.env.REACT_APP_API_URL || ''

const client = axios.create({
  baseURL: ____API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Add request interceptor to include auth token if available
let ____currentToken: string | null = null

export function setAuthToken(token: string | null) {
  ____currentToken = token
  if (token) {
    client.defaults.headers = client.defaults.headers || {}
    client.defaults.headers.Authorization = `Bearer ${token}`
  } else if (client.defaults.headers) {
    delete (client.defaults.headers as any).Authorization
  }
}

// initialize from localStorage if present for backward compatibility
____currentToken = localStorage.getItem('authToken')
if (____currentToken) setAuthToken(____currentToken)

client.interceptors.request.use(
  (config) => {
    if (____currentToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${____currentToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export function clearAuthToken() {
  ____currentToken = null
  if (client.defaults.headers) {
    delete (client.defaults.headers as any).Authorization
  }
}

export default client
