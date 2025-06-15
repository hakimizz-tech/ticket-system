import React from 'react'
import TicketCard from './TicketCard'
import { motion } from 'framer-motion'
import type { Ticket } from '../utils/validation'
import { useTicketStore } from '@/store/ticketStore'
import {RotateCw} from 'lucide-react'

interface TicketsTabProps {
  tickets: Ticket[]
  onDelete: (id: string) => void
}

const TicketsTab: React.FC<TicketsTabProps> = ({ tickets, onDelete }) => {
  const {reset} = useTicketStore()


  // Animation variants for the container
  // This will fade in the tickets with a staggered effect
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

  const rotate_button_180_onclick = () => {
      // have smooth transition
      const rotateButton = document.querySelector('.rotate-button') as HTMLElement;
      if (rotateButton) {
        rotateButton.style.transition = 'transform 0.5s ease-in-out';
        rotateButton.style.transform = 'rotate(360deg)';
        setTimeout(() => {
          rotateButton.style.transform = 'rotate(0deg)';
        }, 500);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-6">Your Tickets</h2>
        <span>
          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {/* onclick rotate 360 degres */}
            <RotateCw className="w-4 h-4 rotate-button" onClick={rotate_button_180_onclick}/>
            Reset Tickets
          </button>
        </span>
      </div>
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
