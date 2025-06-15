import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, endpoints } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'sonner'
import type { Ticket, Teller } from '../utils/validation'
import {
  CalendarIcon,
  FilterIcon,
  LogOutIcon,
  CheckCircleIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
export default function AdminDashboard() {
  const { user, accessToken, logout } = useAuth()
  const navigate = useNavigate()
  // Add this effect to verify token on mount
  useEffect(() => {
    if (!accessToken) {
      navigate('/login')
    }
  }, [accessToken, navigate])
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  )
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'served' | 'completed' | 'canceled'
  >('all')
  const [showActiveTellersOnly, setShowActiveTellersOnly] = useState(true) // Changed default to true
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['tickets', selectedDate, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedDate) params.append('date', selectedDate)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      const url = `${endpoints.listTickets}?${params.toString()}`
      const response = await api.get(url)
      return response.data
    },
  })
  const { data: tellersData } = useQuery({
    queryKey: ['tellers', showActiveTellersOnly],
    queryFn: async () => {
      const url = `${endpoints.listTellers}${showActiveTellersOnly ? '?active=false' : ''}`
      const response = await api.get(url)
      return response.data
    },
  })
  const serveTicketMutation = useMutation({
    mutationFn: async ({
      ticketId,
      tellerId,
    }: {
      ticketId: string
      tellerId: string
    }) => {
      const response = await api.post(endpoints.serveTicket(ticketId), {
        teller_id: tellerId,
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message, {
        position: 'bottom-right',
      })
      queryClient.invalidateQueries({
        queryKey: ['tickets'],
      })
      queryClient.invalidateQueries({
        queryKey: ['tellers'],
      })
    },
    onError: () => {
      toast.error('Failed to serve ticket', {
        position: 'bottom-right',
      })
    },
  })
  const completeTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await api.put(endpoints.completeTicket(ticketId))
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message, {
        position: 'bottom-right',
      })
      // Mark ticket as completed in UI
      const updatedTicket = {
        ...data.ticket,
        completed: true,
        status: 'completed' as const,
      }
      queryClient.setQueryData(['tickets'], (old: any) => ({
        ...old,
        tickets: old.tickets.map((t: Ticket) =>
          t.id === updatedTicket.id ? updatedTicket : t,
        ),
      }))
    },
    onError: () => {
      toast.error('Failed to complete ticket', {
        position: 'bottom-right',
      })
    },
  })
  const filteredTickets =
    ticketsData?.tickets.filter((ticket) => {
      if (filterStatus === 'all') return true
      if (
        filterStatus === 'completed' &&
        (ticket.status === 'completed' || ticket.completed)
      )
        return true
      if (
        filterStatus === 'canceled' &&
        (ticket.status === 'canceled' || ticket.canceled)
      )
        return true
      return ticket.status === filterStatus
    }) ?? []
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Ticket Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <LogOutIcon size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black"
              >
                <option value="all">All Tickets</option>
                <option value="pending">Pending</option>
                <option value="served">Served</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teller Filter
              </label>
              <label className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  checked={showActiveTellersOnly}
                  onChange={(e) => setShowActiveTellersOnly(e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm text-gray-600">
                  Show Available Tellers Only
                </span>
              </label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Tickets</h2>
                  <p className="text-sm text-gray-600">
                    Total: {ticketsData?.total_tickets || 0}
                  </p>
                </div>
                {isLoadingTickets ? (
                  <div className="text-center py-4">Loading tickets...</div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {filteredTickets.map((ticket) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          tellers={
                            tellersData?.tellers.filter((t) => !t.is_active) ??
                            []
                          }
                          onServeTeller={(tellerId) =>
                            serveTicketMutation.mutate({
                              ticketId: ticket.id,
                              tellerId,
                            })
                          }
                          onComplete={() =>
                            completeTicketMutation.mutate(ticket.id)
                          }
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Tellers</h2>
              <div className="space-y-3">
                {tellersData?.tellers.map((teller) => (
                  <div
                    key={teller.id}
                    className={`p-3 rounded-lg border ${teller.is_active ? 'border-gray-300 bg-gray-50' : 'border-green-500 bg-green-50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{teller.name}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${teller.is_active ? 'bg-gray-200 text-gray-800' : 'bg-green-200 text-green-800'}`}
                      >
                        {teller.is_active ? 'Busy' : 'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
interface TicketCardProps {
  ticket: Ticket
  tellers: Teller[]
  onServeTeller: (tellerId: string) => void
  onComplete: () => void
}
function TicketCard({
  ticket,
  tellers,
  onServeTeller,
  onComplete,
}: TicketCardProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  const getStatusColor = (status: string, completed?: boolean) => {
    if (completed) return 'bg-green-600 text-white'
    if (status === 'canceled') return 'bg-red-600 text-white'
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white'
      case 'pending':
        return 'bg-[#0066ff] text-white'
      case 'served':
        return 'bg-black text-white'
      case 'canceled':
        return 'bg-red-600 text-white'
      default:
        return 'bg-[#0066ff] text-white'
    }
  }
  const getActionButton = (ticket: Ticket) => {
    if (ticket.canceled || ticket.status === 'canceled') {
      return (
        <span className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg flex items-center space-x-1 opacity-75">
          <span>Canceled</span>
        </span>
      )
    }
    if (ticket.completed || ticket.status === 'completed') {
      return (
        <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg flex items-center space-x-1">
          <CheckCircleIcon size={16} />
          <span>Completed</span>
        </span>
      )
    }
    if (ticket.status === 'served') {
      return (
        <button
          onClick={onComplete}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
        >
          <CheckCircleIcon size={16} />
          <span>Complete</span>
        </button>
      )
    }
    return (
      <div className="relative">
        <button
          onClick={() => setIsAssigning(!isAssigning)}
          className="px-3 py-1 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Assign Teller
        </button>
        {isAssigning && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            {tellers.map((teller) => (
              <button
                key={teller.id}
                onClick={() => {
                  onServeTeller(teller.id)
                  setIsAssigning(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                {teller.name}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      className={`bg-white border rounded-lg shadow-sm p-4 ${ticket.completed || ticket.status === 'completed' ? 'border-green-500 bg-green-50' : ticket.canceled || ticket.status === 'canceled' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.canceled ? 'canceled' : ticket.status, ticket.completed)}`}
            >
              {ticket.canceled ? 'canceled' : ticket.status}
            </span>
            <h3 className="text-lg font-semibold">#{ticket.ticket_number}</h3>
          </div>
          <p className="text-sm text-gray-600">{ticket.ticket_type}</p>
          {ticket.Teller && (
            <p className="text-sm text-gray-600">Teller: {ticket.Teller}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {new Date(ticket.issue_date).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getActionButton(ticket)}
        </div>
      </div>
    </motion.div>
  )
}
