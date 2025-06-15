import { z } from 'zod'
export const loginSchema = z.object({
  username: z.string().min(3, 'Username required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})
export type LoginFormData = z.infer<typeof loginSchema>
export interface Ticket {
  id: string
  ticket_number: string
  ticket_type: string
  status: 'pending' | 'served' | 'completed' | 'canceled'
  Teller: string | null
  issue_date: string
  completed?: boolean
  canceled?: boolean
}
export interface NewTicketResponse {
  message: string
  ticket: Ticket
}
export interface TicketActionResponse {
  message: string
  status: 'ok' | 'error'
}
export interface User {
  id: string
  username: string
  email: string
}
export interface LoginResponse {
  access_token: string
  refresh_token: string
  message: string
  status: string
  user: User
}
export interface Teller {
  id: string
  name: string
  is_active: boolean
}
export interface TellerResponse {
  tellers: Teller[]
  total: number
}
export interface TicketListResponse {
  date: string
  message: string
  status: string
  tickets: Ticket[]
  total_tickets: number
}
export interface RefreshTokenResponse {
  access_token: string
  message: string
  status: string
}
export interface CompleteTicketResponse {
  message: string
  teller: Teller
  ticket: Ticket
}
export interface AutoAssignResponse {
  message: string
  teller: Teller
  ticket: Ticket
}
