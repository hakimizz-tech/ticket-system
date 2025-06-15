import axios from 'axios'
const BASE_URL = 'http://localhost:5000/api'
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const TICKET_TYPES = {
  withdrawal: 'W',
  deposit: 'D',
  transfer: 'T',
  inquiry: 'I',
  other: 'O',
} as const

export const endpoints = {
  login: '/login',
  refresh: '/refresh',
  newTicket: '/ticket/new',
  cancelTicket: '/ticket/cancel',
  validateTicket: '/ticket/valid',
  listTickets: '/ticket/list', // Now supports ?status=completed parameter
  listTellers: '/tellers',
  serveTicket: (ticketId: string) => `/ticket/${ticketId}/serve`,
  completeTicket: (ticketId: string) => `/ticket/${ticketId}/complete`,
  autoAssignTicket: (ticketId: string) => `/tickets/${ticketId}/auto-assign`,
}

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export const setRefreshToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
