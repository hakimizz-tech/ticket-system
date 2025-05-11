import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './pages/Dashboard'
import Login from './pages/login'
import AdminDashboard from './pages/AdminDashboard'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient()
function App() {
  return(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="w-full min-h-screen bg-white text-black">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/login"
              element={
                <AuthProvider>
                  <Login />
                </AuthProvider>
              }
            />
            <Route
              path="/admin"
              element={
                <AuthProvider>
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                </AuthProvider>
              }
            />
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
