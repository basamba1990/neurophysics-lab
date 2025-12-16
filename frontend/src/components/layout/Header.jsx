import React from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Bell, User, Menu, X } from 'lucide-react'


const Header = ({ onMenuClick, sidebarOpen }) => {
  const { user } = useAuth()
  return (
    <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 md:px-6">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick} 
          className="p-2 mr-4 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors md:hidden"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="text-lg font-medium text-gray-800">
          {/* Le titre de la page actuelle pourrait être affiché ici */}
          R&D Accelerator
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">{user?.full_name || "Utilisateur"}</span>
          <div className="p-2 rounded-full bg-blue-500 text-white">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
