import React from 'react'
import { motion } from 'framer-motion'
interface TabContainerProps {
  activeTab: 'book' | 'tickets'
  setActiveTab: (tab: 'book' | 'tickets') => void
}
const TabContainer: React.FC<TabContainerProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="w-full bg-black text-white px-4 md:px-6 flex ">
      <div className="w-full max-w-3xl mx-auto flex">
        <button
          className={`relative py-4 px-6 font-medium ${activeTab === 'book' ? 'text-[#0066ff]' : 'text-gray-400'}`}
          onClick={() => setActiveTab('book')}
        >
          Book Ticket
          {activeTab === 'book' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066ff]"
              layoutId="activeTab"
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
        </button>
        <button
          className={`relative py-4 px-6 font-medium ${activeTab === 'tickets' ? 'text-[#0066ff]' : 'text-gray-400'}`}
          onClick={() => setActiveTab('tickets')}
        >
          Tickets
          {activeTab === 'tickets' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066ff]"
              layoutId="activeTab"
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
        </button>
      </div>
    </div>
  )
}
export default TabContainer
