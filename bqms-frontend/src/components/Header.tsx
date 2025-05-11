import  { useState } from 'react'
import { ArrowLeftIcon, UserIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
const Header = () => {
  const [showProfile, setShowProfile] = useState(false)
  return (
    <header className="w-full bg-black text-white p-4 md:p-6">
      <div className="w-full max-w-3xl mx-auto flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">Ticket Dashboard</h1>
        <div className="flex items-center space-x-4">
          <motion.button
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            onClick={() => setShowProfile(!showProfile)}
            whileTap={{
              scale: 0.95,
            }}
          >
            <ArrowLeftIcon size={24} />
          </motion.button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
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
                  x: 20,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <Link to="/login">
                  <motion.button
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    whileHover={{
                      scale: 1.05,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                  >
                    <UserIcon size={24} />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
export default Header
