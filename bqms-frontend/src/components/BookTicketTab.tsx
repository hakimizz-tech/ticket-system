/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import type { Ticket } from '../utils/validation'
import { useMutation } from '@tanstack/react-query'
import { api, endpoints, TICKET_TYPES } from '../utils/api'
import { toast } from 'sonner'
interface BookTicketTabProps {
  onSubmit: (ticket: Ticket, isUpdate?: boolean) => void
}
const BookTicketTab: React.FC<BookTicketTabProps> = ({ onSubmit }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      ticketType: 'withdrawal',
    },
  })
  const selectedType = watch('ticketType')
  const createTicketMutation = useMutation({
    mutationFn: async (type: keyof typeof TICKET_TYPES) => {
      const response = await api.post(endpoints.newTicket, {
        ticket_type: TICKET_TYPES[type],
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message, {
        position: 'bottom-right',
      })
      onSubmit(data.ticket, false) // false indicates new ticket
      // Start auto-assign process after 10 seconds
      setTimeout(async () => {
        try {
          const response = await api.get(
            endpoints.autoAssignTicket(data.ticket.id),
          )
          // Handle 204 status (no content)
          if (response.status === 204) {
            toast.error('No tellers available at the moment', {
              position: 'bottom-right',
            })
            return
          }
          const autoAssignData = response.data
          onSubmit(autoAssignData.ticket, true) // true indicates update
          toast.success(autoAssignData.message, {
            position: 'bottom-right',
          })
        } catch (error) {
          toast.error('Failed to auto-assign ticket', {
            position: 'bottom-right',
          })
        }
      }, 10000)
    },
    onError: () => {
      toast.error('Failed to create ticket', {
        position: 'bottom-right',
      })
    },
  })
  const onFormSubmit = () => {
    createTicketMutation.mutate(selectedType as keyof typeof TICKET_TYPES)
  }
  const buttonVariants = {
    selected: {
      backgroundColor: '#0066ff',
      color: '#fff',
      scale: 1.05,
      boxShadow: '0 4px 6px rgba(0, 102, 255, 0.2)',
    },
    notSelected: {
      backgroundColor: '#fff',
      color: '#000',
      scale: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
  }
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Book a New Ticket</h2>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-4">
            Select Ticket Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['withdrawal', 'deposit', 'transfer', 'inquiry', 'other'].map(
              (type) => (
                <motion.label
                  key={type}
                  className="relative cursor-pointer flex flex-col items-center justify-center p-4 border rounded-lg"
                  animate={selectedType === type ? 'selected' : 'notSelected'}
                  variants={buttonVariants}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <input
                    type="radio"
                    value={type}
                    {...register('ticketType')}
                    className="sr-only"
                  />
                  <span className="capitalize">{type}</span>
                </motion.label>
              ),
            )}
          </div>
        </div>
        <motion.button
          type="submit"
          disabled={createTicketMutation.isPending}
          className="w-full py-3 px-4 bg-black text-white font-medium rounded-lg"
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
        >
          {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
        </motion.button>
      </form>
    </div>
  )
}
export default BookTicketTab
