import React from 'react'
import { motion } from 'framer-motion'
import { TrashIcon, CheckCircleIcon } from 'lucide-react'
import type { Ticket } from '../utils/validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, endpoints } from '../utils/api'
import { toast } from 'sonner'
interface TicketCardProps {
  ticket: Ticket
  onDelete: (id: string) => void
}
const TicketCard: React.FC<TicketCardProps> = ({ ticket, onDelete }) => {
  const queryClient = useQueryClient()

  // cancela ticket
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(endpoints.cancelTicket, {
        ticket_number: ticket.ticket_number,
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message, {
        position: 'bottom-right',
      })
      onDelete(ticket.id)
    },
    onError: () => {
      toast.error('Failed to cancel ticket', {
        position: 'bottom-right',
      })
    },
  })

  // validate a ticket
  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(endpoints.validateTicket, {
        ticket_number: ticket.ticket_number,
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message, {
        position: 'bottom-right',
      })
      if (data.status === 'error') {
        onDelete(ticket.id)
      }
      // Update cache if needed
      queryClient.invalidateQueries({
        queryKey: ['tickets'],
      })
    },
    onError: () => {
      toast.error('Failed to validate ticket', {
        position: 'bottom-right',
      })
    },
  })

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-[#0066ff] text-white'
      case 'served':
        return 'bg-black text-white'
      default:
        return 'bg-[#0066ff] text-white'
    }
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    show: {
      opacity: 1,
      y: 0,
    },
  }
  
  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:border-[#0066ff] transition-colors"
      variants={cardVariants}
      layout
      exit={{
        opacity: 0,
        scale: 0.8,
      }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
              >
                {ticket.status}
              </span>
              <h3 className="text-lg font-semibold">#{ticket.ticket_number}</h3>
            </div>
            <p className="text-sm text-gray-600 capitalize mb-1">
              Type: {ticket.ticket_type}
            </p>
            {ticket.Teller && (
              <p className="text-sm text-gray-600">Teller: {ticket.Teller}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {new Date(ticket.issue_date).toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <motion.button
              onClick={() => validateMutation.mutate()}
              disabled={validateMutation.isPending}
              className="p-2 text-gray-500 hover:text-[#0066ff] hover:bg-blue-50 rounded-full"
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <CheckCircleIcon size={18} />
            </motion.button>
            <motion.button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="p-2 text-gray-500 hover:text-[#0066ff] hover:bg-blue-50 rounded-full"
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <TrashIcon size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
export default TicketCard
