import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import BotBuilder from './pages/BotBuilder'
import Dashboard from './pages/Dashboard'
import EmbedCode from './pages/EmbedCode'
import KnowledgeBase from './pages/KnowledgeBase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/bot/:id" element={
          <PrivateRoute><BotBuilder /></PrivateRoute>
        } />
        <Route path="/bot/:id/knowledge" element={
          <PrivateRoute><KnowledgeBase /></PrivateRoute>
        } />
        <Route path="/bot/:id/embed" element={
          <PrivateRoute><EmbedCode /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App