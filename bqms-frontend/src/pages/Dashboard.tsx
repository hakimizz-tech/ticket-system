import React, { useState } from 'react'
import Header from '../components/Header'
import TabContainer from '../components/TabContainer'
import BookTicketTab from '../components/BookTicketTab'
import TicketsTab from '../components/TicketsTab'
import { motion, AnimatePresence } from 'framer-motion'
import type { Ticket } from '../utils/validation'
import { Toaster } from 'sonner'
import { useTicketStore } from '../store/ticketStore'



export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'book' | 'tickets'>('book')
  const { tickets, addTicket, updateTicket, removeTicket,} = useTicketStore()

  const handleCreateTicket = (newTicket: Ticket, isUpdate: boolean = false) => {
    if (isUpdate) {
      updateTicket(newTicket)
    } else {
      addTicket(newTicket)
      setActiveTab('tickets')
    }
  }
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <TabContainer activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-4 md:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'book' ? (
            <motion.div
              key="book"
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 20,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <BookTicketTab onSubmit={handleCreateTicket} />
            </motion.div>
          ) : (
            <motion.div
              key="tickets"
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <TicketsTab tickets={tickets} onDelete={removeTicket} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  )
}

