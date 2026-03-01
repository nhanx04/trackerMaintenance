import { apiRequest } from './api'
import type { Ticket, CreateTicketRequest, UpdateTicketRequest, TicketPage } from '@/types/ticket'

const BASE = '/api/tickets'

// GET ALL
export function getTickets(token: string) {
  return apiRequest<TicketPage>('/api/tickets', { method: 'GET' }, token)
}

// GET ONE
export function getTicket(id: number, token: string) {
  return apiRequest<Ticket>(`${BASE}/${id}`, { method: 'GET' }, token)
}

// CREATE
export function createTicket(data: CreateTicketRequest, token: string) {
  return apiRequest<Ticket>(
    BASE,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    },
    token
  )
}

// UPDATE
export function updateTicket(id: number, data: UpdateTicketRequest, token: string) {
  return apiRequest<Ticket>(
    `${BASE}/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    },
    token
  )
}

// DELETE
export function deleteTicket(id: number, token: string) {
  return apiRequest<void>(`${BASE}/${id}`, { method: 'DELETE' }, token)
}

// CANCEL
export function cancelTicket(id: number, token: string) {
  return apiRequest<void>(`${BASE}/${id}/cancel`, { method: 'PATCH' }, token)
}
