import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Ticket } from '../utils/validation'

interface TicketStore {
  tickets: Ticket[]
  addTicket: (ticket: Ticket) => void
  removeTicket: (id: string) => void
  updateTicket: (ticket: Ticket) => void
  reset : () => void
}

export const useTicketStore = create<TicketStore>()(
  persist(
    (set) => ({
      tickets: [],

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets, ticket],
        })),

      removeTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((ticket) => ticket.id !== id),
        })),
        
      updateTicket: (updatedTicket) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === updatedTicket.id ? updatedTicket : ticket
          ),
        })),
      reset: () => set({ tickets: [] }),
    }),
    {
      name: 'ticket-storage',
    }
  )
)