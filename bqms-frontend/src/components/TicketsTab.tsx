import React from 'react'
import TicketCard from './TicketCard'
import { motion } from 'framer-motion'
import type { Ticket } from '../utils/validation'

interface TicketsTabProps {
  tickets: Ticket[]
  onDelete: (id: string) => void
}

const TicketsTab: React.FC<TicketsTabProps> = ({ tickets, onDelete }) => {
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Tickets</h2>
      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tickets found</p>
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onDelete={() => onDelete(ticket.id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
export default TicketsTab
